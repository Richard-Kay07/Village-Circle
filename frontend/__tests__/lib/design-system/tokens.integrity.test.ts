/**
 * Token integrity checks: required aliases, no duplicate keys, module/status coverage.
 */

import {
  tokens,
  primitives,
  semantic,
  moduleAccents,
  statusTokens,
  MODULE_ACCENT_ALIASES,
} from '@/lib/design-system/tokens';

describe('Token integrity', () => {
  it('primitives has required color scales', () => {
    expect(primitives.color.gray).toBeDefined();
    expect(primitives.color.blue).toBeDefined();
    expect(primitives.color.green).toBeDefined();
    expect(primitives.color.red).toBeDefined();
    expect(primitives.color.amber).toBeDefined();
  });

  it('primitives has typography, spacing, radius, shadow, borderWidth, zIndex, motion', () => {
    expect(primitives.typography.fontSize).toBeDefined();
    expect(primitives.typography.fontWeight).toBeDefined();
    expect(primitives.spacing).toBeDefined();
    expect(primitives.radius).toBeDefined();
    expect(primitives.shadow).toBeDefined();
    expect(primitives.borderWidth).toBeDefined();
    expect(primitives.zIndex).toBeDefined();
    expect(primitives.motion.duration).toBeDefined();
    expect(primitives.motion.easing).toBeDefined();
  });

  it('semantic has surface, text, border, action, focus, disabled and feedback', () => {
    expect(semantic.surface).toBeDefined();
    expect(semantic.text).toBeDefined();
    expect(semantic.border).toBeDefined();
    expect(semantic.action.primary).toBeDefined();
    expect(semantic.action.danger).toBeDefined();
    expect(semantic.focus).toBeDefined();
    expect(semantic.disabled).toBeDefined();
    expect(semantic.success).toBeDefined();
    expect(semantic.warning).toBeDefined();
    expect(semantic.error).toBeDefined();
    expect(semantic.info).toBeDefined();
  });

  it('module accents include all five modules with default and bg', () => {
    const required = ['vcSave', 'vcHub', 'vcGrow', 'vcPay', 'vcLearn'] as const;
    required.forEach((id) => {
      expect(moduleAccents[id]).toBeDefined();
      expect(moduleAccents[id].default).toBeDefined();
      expect(moduleAccents[id].bg).toBeDefined();
      expect(typeof moduleAccents[id].default).toBe('string');
    });
  });

  it('every module has all required accent aliases', () => {
    const moduleIds = ['vcSave', 'vcHub', 'vcGrow', 'vcPay', 'vcLearn'] as const;
    moduleIds.forEach((id) => {
      MODULE_ACCENT_ALIASES.forEach((key) => {
        expect(moduleAccents[id][key]).toBeDefined();
        expect(typeof moduleAccents[id][key]).toBe('string');
      });
    });
  });

  it('semantic status colors are separate from module accent colors', () => {
    const successBg = semantic.success.bg;
    const warningBg = semantic.warning.bg;
    const errorBg = semantic.error.bg;
    const moduleAccentValues = ['vcSave', 'vcHub', 'vcGrow', 'vcPay', 'vcLearn'].flatMap(
      (id) => [moduleAccents[id as keyof typeof moduleAccents].accent, moduleAccents[id as keyof typeof moduleAccents].accentSoftBg]
    );
    expect(moduleAccentValues).not.toContain(successBg);
    expect(moduleAccentValues).not.toContain(warningBg);
    expect(moduleAccentValues).not.toContain(errorBg);
  });

  it('status tokens include recorded, pending, approved, overdue, reversed, failed, delivered', () => {
    const required = ['recorded', 'pending', 'approved', 'overdue', 'reversed', 'failed', 'delivered'] as const;
    required.forEach((id) => {
      expect(statusTokens[id]).toBeDefined();
      expect(statusTokens[id].bg).toBeDefined();
      expect(statusTokens[id].text).toBeDefined();
    });
  });

  it('tokens exposes primitives, semantic, module, status and legacy color/space/font', () => {
    expect(tokens.primitives).toBe(primitives);
    expect(tokens.semantic).toBe(semantic);
    expect(tokens.module).toBe(moduleAccents);
    expect(tokens.status).toBe(statusTokens);
    expect(tokens.color).toBeDefined();
    expect(tokens.color.primary).toBeDefined();
    expect(tokens.space).toBeDefined();
    expect(tokens.font).toBeDefined();
    expect(tokens.radius).toBeDefined();
    expect(tokens.shadow).toBeDefined();
  });

  it('no duplicate top-level keys in tokens', () => {
    const topKeys = Object.keys(tokens);
    const set = new Set(topKeys);
    expect(set.size).toBe(topKeys.length);
  });

  it('semantic action danger is distinct from primary (destructive not primary)', () => {
    expect(semantic.action.danger.bg).not.toBe(semantic.action.primary.bg);
  });

  it('focus token has ring or color for visibility', () => {
    expect(semantic.focus.ring || semantic.focus.color).toBeTruthy();
  });
});
