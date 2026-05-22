export function TopBar({ agentName }: { agentName: string }) {
  return (
    <div 
      className="flex items-center justify-between py-3 mb-4"
      style={{ borderBottom: '1px solid #1a2e1d' }}
    >
      <h1
        className="text-2xl font-semibold"
        style={{ 
          fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
          color: '#c9b99a'
        }}
      >
        {agentName}
      </h1>
      <div className="flex items-center gap-2">
        <span 
          className="text-xs uppercase tracking-wider"
          style={{ 
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#6b8f72'
          }}
        >
          Online
        </span>
        <div 
          className="w-2.5 h-2.5 rounded-full status-pulse"
          style={{ backgroundColor: '#6b8f72' }}
        />
      </div>
    </div>
  )
}
