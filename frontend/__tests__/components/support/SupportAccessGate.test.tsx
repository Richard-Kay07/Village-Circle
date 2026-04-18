import React from 'react';
import { render, screen } from '@testing-library/react';
import { SupportAccessGate } from '@/components/support/SupportAccessGate';
import { SupportAccessProvider, useSupportAccess } from '@/lib/support/context';

function TraceContent() {
  const { isActive } = useSupportAccess();
  return <div data-testid="trace-content">{isActive ? 'Trace loaded' : 'No access'}</div>;
}

describe('SupportAccessGate', () => {
  it('blocks trace content without reason/case ID and shows gate form', () => {
    render(
      <SupportAccessProvider>
        <SupportAccessGate>
          <TraceContent />
        </SupportAccessGate>
      </SupportAccessProvider>
    );
    expect(screen.getByTestId('trace-content')).toHaveTextContent('No access');
    expect(screen.getByLabelText(/Case \/ incident ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start support access/i })).toBeInTheDocument();
  });

  it('shows children when support access is set', () => {
    function GateWithSetter() {
      const { setState } = useSupportAccess();
      React.useEffect(() => {
        setState({
          supportCaseOrIncidentId: 'INC-1',
          reasonCode: 'TEST',
          tenantGroupId: 'g1',
          actorUserId: 'u1',
        });
      }, [setState]);
      return (
        <SupportAccessGate>
          <TraceContent />
        </SupportAccessGate>
      );
    }
    render(
      <SupportAccessProvider>
        <GateWithSetter />
      </SupportAccessProvider>
    );
    expect(screen.getByTestId('trace-content')).toHaveTextContent('Trace loaded');
  });
});
