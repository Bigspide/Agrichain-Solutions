import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { motion } from 'framer-motion';

export const FieldHealthReport = ({ fieldName, ndvi, status, highlights }: any) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#050a05', 
      color: 'white', 
      fontFamily: 'Geist, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        style={{ 
          width: '80%', 
          padding: '40px', 
          borderRadius: '24px', 
          background: 'linear-gradient(135deg, rgba(20,40,20,0.8) 0%, rgba(0,0,0,0.8) 100%)',
          border: '1px solid rgba(0,255,0,0.2)',
          boxShadow: '0 0 50px rgba(0,255,0,0.1)',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '60px', marginBottom: '20px', color: '#4ade80' }}>AgriChain Insight</h1>
        <h2 style={{ fontSize: '40px', marginBottom: '10px' }}>Field: {fieldName}</h2>
        <div style={{ fontSize: '80px', fontWeight: 'bold', margin: '30px 0', color: status === 'poor' ? '#ef4444' : '#4ade80' }}>
          NDVI: {ndvi.toFixed(2)}
        </div>
        <p style={{ fontSize: '24px', opacity: 0.8 }}>Status: {status.toUpperCase()}</p>
        
        <div style={{ marginTop: '40px', textAlign: 'left', display: 'grid', gap: '10px' }}>
          {highlights.map((h: string, i: number) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 + i * 0.5 }}
              key={i} 
              style={{ fontSize: '20px', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span>✓</span> {h}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AbsoluteFill>
  );
};
