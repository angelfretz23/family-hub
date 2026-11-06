type PlaceholderPanelProps = {
  heading: string;
  body: string;
};

export function PlaceholderPanel({ heading, body }: PlaceholderPanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-heading">{heading}</h2>
      <p className="panel-body">{body}</p>
    </section>
  );
}
