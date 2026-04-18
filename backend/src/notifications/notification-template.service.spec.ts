import { renderTemplate, renderNotification } from './notification-template.service';

describe('NotificationTemplateService', () => {
  describe('renderTemplate', () => {
    it('replaces {{key}} with payload value', () => {
      const out = renderTemplate('Hello {{name}}, you have {{count}} items.', { name: 'Alice', count: 3 });
      expect(out).toBe('Hello Alice, you have 3 items.');
    });

    it('handles missing keys as empty string', () => {
      const out = renderTemplate('Hi {{name}}, {{missing}}.', { name: 'Bob' });
      expect(out).toBe('Hi Bob, .');
    });

    it('handles null/undefined payload', () => {
      const out = renderTemplate('Hello {{name}}', null);
      expect(out).toBe('Hello ');
    });

    it('handles empty payload', () => {
      const out = renderTemplate('Hello {{name}}', {});
      expect(out).toBe('Hello ');
    });

    it('leaves non-placeholder text unchanged', () => {
      const out = renderTemplate('No vars here.', { x: 1 });
      expect(out).toBe('No vars here.');
    });

    it('render fails predictably for invalid template (no throw)', () => {
      const out = renderTemplate('{{a}}{{b}}', { a: 'x' });
      expect(out).toBe('x');
    });
  });

  describe('renderNotification', () => {
    it('renders subject and body with same payload', () => {
      const result = renderNotification(
        'Reminder: {{title}}',
        'Hi {{name}}, reminder: {{title}}.',
        { title: 'Meeting', name: 'User' },
      );
      expect(result.subject).toBe('Reminder: Meeting');
      expect(result.body).toBe('Hi User, reminder: Meeting.');
    });

    it('returns null subject when subject is null or empty', () => {
      expect(renderNotification(null, 'Body', {}).subject).toBeNull();
      expect(renderNotification('', 'Body', {}).subject).toBeNull();
    });
  });
});
