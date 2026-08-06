/**
 * PrimeNG preset mapped to AMD design tokens.
 * Source: docs/ux-ui/design.md §7/§8 · docs/specs/domain/landing/design.md §6 (DD-002).
 *
 * Keep this file as the single place PrimeNG's Aura base is customized —
 * mirror any brand color change here from src/styles/tokens.css.
 */
import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const gold = palette('#CFBB66');

export const AmdPreset = definePreset(Aura, {
  semantic: {
    primary: gold,
    colorScheme: {
      light: {
        primary: {
          color: '#CFBB66',
          contrastColor: '#0D141A',
          hoverColor: '#E5D59A',
          activeColor: '#E5D59A'
        },
        surface: {
          0: '#FFFFFF',
          50: '#F2F3F6',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '#0D141A',
          950: '#0D141A'
        },
        formField: {
          hoverBorderColor: '{primary.color}'
        }
      }
    }
  }
});
