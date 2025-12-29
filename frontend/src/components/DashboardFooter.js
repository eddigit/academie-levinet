import React from 'react';
import BUILD_INFO from '../buildInfo';

const DashboardFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 lg:left-64 right-0 bg-paper/80 backdrop-blur-sm border-t border-white/5 z-40">
      <div className="px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted/60">
          <div className="flex items-center gap-4">
            <span>© 2025 Académie Jacques Levinet</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-primary/80">v{BUILD_INFO.version}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{BUILD_INFO.date} {BUILD_INFO.time}</span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline text-text-muted/40">#{BUILD_INFO.commitHash}</span>
          </div>
          <div className="text-text-muted/40">
            Plateforme par <span className="text-primary/60">GILLES KORZEC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
