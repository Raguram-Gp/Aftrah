import type { StatementSnapshot } from '@/lib/statementSnapshot';

type QuoteExtras = NonNullable<StatementSnapshot['quoteExtras']>;

export function QuoteGreeting({ extras }: { extras: QuoteExtras }) {
  return (
    <div className="quote-greeting">
      <div className="quote-greeting-title">{extras.greetingTitle}</div>
      <p className="quote-greeting-body">{extras.greetingBody}</p>
    </div>
  );
}

export function QuoteClosing({ extras }: { extras: QuoteExtras }) {
  return (
    <div className="quote-terms-block">
      <div className="quote-terms-grid">
        <div>
          <div className="quote-terms-heading">Delivery Terms</div>
          <p>{extras.deliveryTerms}</p>
        </div>
        <div>
          <div className="quote-terms-heading">Payment Terms</div>
          {extras.paymentTerms.map((row) => (
            <div key={row.label} className="quote-terms-line">
              <span>{row.label}</span>
              <strong>{row.amount}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="quote-notes-row">
        <div className="quote-terms-heading">Notes</div>
        <ul className="quote-notes-list">
          {extras.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="quote-closing">{extras.closing}</p>
      </div>
    </div>
  );
}
