// frontend/src/styles/styled.d.ts
import "styled-components";
import type { Theme } from "./theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
