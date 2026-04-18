import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidenceField } from '@/components/evidence/EvidenceField';

const defaultValue = { textRef: '', evidenceAttachmentId: null as string | null };

describe('EvidenceField', () => {
  const defaultProps = {
    value: defaultValue,
    onChange: jest.fn(),
    groupId: 'g1',
    uploadedByMemberId: 'm1',
    actorMemberId: 'm1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('text-only evidence: accepts text ref input', () => {
    render(<EvidenceField {...defaultProps} value={{ textRef: 'Bank ref 123', evidenceAttachmentId: null }} />);
    const textarea = screen.getByPlaceholderText(/bank ref/i);
    fireEvent.change(textarea, { target: { value: 'New ref' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ textRef: 'New ref', evidenceAttachmentId: null })
    );
  });

  it('shows locked state message when recordSubmitted is true', () => {
    render(
      <EvidenceField
        {...defaultProps}
        value={{ textRef: 'Ref', evidenceAttachmentId: null }}
        recordSubmitted={true}
      />
    );
    expect(screen.getByText(/evidence is linked to this record and cannot be changed/i)).toBeInTheDocument();
  });

  it('remove button calls onChange with null evidence when not locked', () => {
    const onChange = jest.fn();
    render(
      <EvidenceField
        {...defaultProps}
        onChange={onChange}
        value={{ textRef: '', evidenceAttachmentId: 'e1' }}
        recordSubmitted={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ evidenceAttachmentId: null }));
  });

  it('replace and remove buttons are not shown when recordSubmitted', () => {
    render(
      <EvidenceField
        {...defaultProps}
        value={{ textRef: '', evidenceAttachmentId: 'e1' }}
        recordSubmitted={true}
      />
    );
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /replace/i })).not.toBeInTheDocument();
  });
});
