export default function Divider({ style }) {
  return (
    <div
      style={{
        width: '100%',
        height: '1px',
        backgroundColor: 'var(--color-fg-secondary)',
        opacity: '0.5',
        borderRadius: '999px',
        ...style,
      }}
    />
  );
}
