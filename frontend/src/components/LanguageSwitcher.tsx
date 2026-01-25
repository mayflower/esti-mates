import styled from 'styled-components';
import { useLocale } from '../i18n';

const Container = styled.div`
  display: flex;
  gap: 2px;
  background: ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: 2px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${(props) => (props.$active ? 'white' : props.theme.colors.text)};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.background)};
  }
`;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Container role="group" aria-label="Language selection">
      <ToggleButton
        $active={locale === 'de'}
        data-active={locale === 'de'}
        onClick={() => setLocale('de')}
        aria-pressed={locale === 'de'}
      >
        DE
      </ToggleButton>
      <ToggleButton
        $active={locale === 'en'}
        data-active={locale === 'en'}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </ToggleButton>
    </Container>
  );
}
