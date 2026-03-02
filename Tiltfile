# Tiltfile for MF EstiMates local Kubernetes development

# Build Docker image
docker_build(
    'mf-estimates-dev',
    '.',
    dockerfile='Dockerfile',
    # Live reload: rebuild on file changes
    live_update=[
        # Sync backend source changes
        sync('./backend/src', '/app/backend/src'),
        # Sync frontend source changes
        sync('./frontend/src', '/app/frontend/src'),
        # Restart container on backend changes
        run('cd /app/backend && npm run build', trigger=['./backend/src']),
    ],
)

# Render Helm chart with local dev overrides
k8s_yaml(helm(
    'mayflowerDeploy/production',
    name='mf-estimates',
    values=['mayflowerDeploy/production/values.yaml'],
    set=[
        'images.app.image=mf-estimates-dev',
        'images.app.tag=latest',
        'domain=',  # disable ingress locally
    ],
))

# Define the resource
k8s_resource(
    'mf-estimates',
    port_forwards=[
        '3000:3001',  # Forward local 3000 to container 3001 (HTTP)
        '3001:3001',  # Forward local 3001 to container 3001 (WebSocket)
    ],
    labels=['app'],
)

# Tilt settings
update_settings(max_parallel_updates=1)

# Display useful info
print("""
╔═══════════════════════════════════════════════════════════╗
║  MF EstiMates - Local Kubernetes Development             ║
╟───────────────────────────────────────────────────────────╢
║  Application: http://localhost:3000                      ║
║  Health:      http://localhost:3000/health               ║
║                                                           ║
║  Press 'space' in terminal to open Tilt UI in browser    ║
╚═══════════════════════════════════════════════════════════╝
""")
