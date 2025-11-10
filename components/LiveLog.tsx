
import React, { useEffect, useRef } from 'react';

interface LiveLogProps {
    log: string[];
}

const getLogType = (message: string) => {
    if (message.startsWith('[SUCCESS]')) return 'success';
    if (message.startsWith('[CRITICAL]')) return 'critical';
    if (message.startsWith('[FATAL_ERROR]')) return 'error';
    return 'info';
};

const formatMessage = (message: string) => {
    return message.replace(/\[.*?\]\s?/, '');
};

const LiveLog: React.FC<LiveLogProps> = ({ log }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);
    
    const typeStyles = {
        info: 'text-gray-400',
        success: 'text-green-400',
        critical: 'text-yellow-400 font-bold',
        error: 'text-red-400 font-bold bg-red-500/10',
    };

    return (
        <div ref={logContainerRef} className="h-64 bg-black p-4 rounded-lg border border-corinthians-gray/50 overflow-y-auto font-mono text-sm">
            {log.map((entry, index) => {
                const type = getLogType(entry);
                const message = formatMessage(entry);
                return (
                    <div key={index} className={`flex items-start ${typeStyles[type]} ${type === 'error' ? 'p-2 rounded' : ''}`}>
                        <span className="text-gray-600 mr-3 select-none">{String(index + 1).padStart(2, '0')}</span>
                        <p className="flex-1 whitespace-pre-wrap break-words">{message}</p>
                    </div>
                );
            })}
             <div className="animate-pulse text-gray-500">_</div>
        </div>
    );
};

export default LiveLog;
