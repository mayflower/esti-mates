# Deployment auf dem Mayflower Data Cluster

## Voraussetzungen

- GitHub-Repo mit Topic `deploy-to-cluster` (ArgoCD scannt alle 5 Min)
- Helm Chart unter `mayflowerDeploy/<environment>/`
- `values.sops.yaml` neben `values.yaml` (auch wenn leer)
- GitHub Actions Workflow für Image-Build nach `ghcr.io`

## Cluster-Zugang

- **Cluster**: `data.lan.muc.mayflower.zone:6443`
- **kubeconfig**: `~/.kube/data-lan-mayflower`
- **Auth**: OIDC via [kubelogin](https://github.com/int128/kubelogin)
- **VPN erforderlich** für Cluster-Zugriff

## Automatischer Ablauf

```
Push auf main
  → GitHub Actions baut Docker Image (ghcr.io)
  → Image wird mit Tags <commit-sha> und "latest" gepusht
  → ArgoCD Image Updater erkennt neuen Digest hinter "latest"
  → ArgoCD rollt neuen Pod aus
```

Zeitrahmen: ca. 3-5 Minuten nach Push.

## Namespace

ArgoCD erstellt den Namespace automatisch nach dem Schema:

```
self-service-<repo-name>-<environment>
```

Beispiel: `self-service-esti-mates-production`

Benutzer haben eingeschränkte Rechte im `self-service-*` Namespace (kein Delete, kein Patch auf Deployments).

## Helm Chart Struktur

```
mayflowerDeploy/
  production/
    Chart.yaml
    values.yaml
    values.sops.yaml        # Pflicht, kann leer sein
    templates/
      deployment.yaml
      service.yaml
      ingress.yaml
      configmap.yaml
      image-updater.yaml     # ArgoCD Image Updater CRD
      _helpers.tpl
```

## Intern vs. Extern erreichbar

| | Intern | Extern |
|---|---|---|
| **Domain** | `<name>.data.mayflower.zone` | `<name>.data.mayflower.tech` |
| **Erreichbar von** | Nur im VPN / Firmennetz | Öffentlich über Internet |
| **TLS Issuer** | `letsencrypt-intern-dns` | `letsencrypt` |
| **Challenge-Typ** | DNS-01 (via Route53) | HTTP-01 (via Traefik) |

### Ingress-Konfiguration für interne Domain

```yaml
annotations:
  traefik.ingress.kubernetes.io/router.entrypoints: websecure
  cert-manager.io/cluster-issuer: letsencrypt-intern-dns
spec:
  tls:
    - hosts:
        - app.data.mayflower.zone
      secretName: app-tls
  rules:
    - host: app.data.mayflower.zone
```

### Ingress-Konfiguration für externe Domain

```yaml
annotations:
  traefik.ingress.kubernetes.io/router.entrypoints: websecure
  cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts:
        - app.data.mayflower.tech
      secretName: app-tls
  rules:
    - host: app.data.mayflower.tech
```

## Image Updater

Der ArgoCD Image Updater überwacht per **Digest-Strategie** den `latest`-Tag im Container Registry. Wenn CI ein neues Image als `latest` pusht, ändert sich der SHA256-Digest. Der Image Updater erkennt dies und triggert ein Redeployment.

```yaml
apiVersion: argocd-image-updater.argoproj.io/v1alpha1
kind: ImageUpdater
metadata:
  name: {{ .Release.Name }}
spec:
  namespace: argocd
  applicationRefs:
    - namePattern: {{ .Release.Name | quote }}
      images:
        - alias: app
          imageName: "ghcr.io/org/repo/image:latest"
          commonUpdateSettings:
            updateStrategy: digest
          manifestTargets:
            helm:
              name: "images.app.image"
              tag: "images.app.tag"
```

## CI/CD Pipeline (GitHub Actions)

- **Runner**: `mayflower-k8s-runners` (Self-hosted auf dem Cluster)
- **Registry**: `ghcr.io` mit `GITHUB_TOKEN` Auth
- **ImagePullSecret**: `github-registry` (existiert bereits auf dem Cluster)

## Referenzprojekt

Das [mayflower/voicebot](https://github.com/mayflower/voicebot) Repo dient als Referenz für die Deployment-Konfiguration.
