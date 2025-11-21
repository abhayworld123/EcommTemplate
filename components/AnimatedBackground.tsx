'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BackgroundConfig } from '@/types';

export default function AnimatedBackground() {
  const [config, setConfig] = useState<BackgroundConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/background-config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !config || !config.is_active) {
    return null;
  }

  const {
    type,
    primary_color,
    secondary_color,
    tertiary_color,
    speed,
    opacity,
    blur,
  } = config;

  const speedDuration = Math.max(1, 20 - (speed || 5) * 1.5); // 5 = 12.5s, 10 = 5s

  const containerStyle = {
    opacity: (opacity || 100) / 100,
    filter: blur ? `blur(${blur}px)` : 'none',
  };

  if (type === 'gradient') {
    return (
      <div className="fixed inset-0 -z-50 overflow-hidden" style={containerStyle}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${primary_color}, ${secondary_color}, ${tertiary_color})`,
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: speedDuration * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (type === 'mesh') {
    return (
      <div className="fixed inset-0 -z-50 overflow-hidden bg-white" style={containerStyle}>
        <motion.div
          className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
          style={{ backgroundColor: primary_color }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: speedDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
          style={{ backgroundColor: secondary_color }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: speedDuration * 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
          style={{ backgroundColor: tertiary_color }}
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: speedDuration * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="fixed inset-0 -z-50 overflow-hidden" style={{ ...containerStyle, backgroundColor: primary_color }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${secondary_color} 1px, transparent 1px), linear-gradient(90deg, ${secondary_color} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 0%, ${primary_color} 100%)`,
            }}
          />
        </div>
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${secondary_color} 1px, transparent 1px), linear-gradient(90deg, ${secondary_color} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            opacity: 0.1,
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: speedDuration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  if (type === 'particles') {
    return (
      <div className="fixed inset-0 -z-50 overflow-hidden" style={{ ...containerStyle, backgroundColor: primary_color }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? secondary_color : tertiary_color,
              width: Math.random() * 20 + 5,
              height: Math.random() * 20 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: Math.random() * 5 + speedDuration,
              repeat: Infinity,
              ease: 'easeOut',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

