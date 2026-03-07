import Header from './Header';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col w-full bg-background text-text-main">
            <Header />
            <main className="flex-grow container mx-auto max-w-4xl px-4 py-8">
                {children}
            </main>
            <footer className="py-6 text-center text-text-muted text-sm border-t border-surface">
                <p>&copy; {new Date().getFullYear()} Logic Looper. Play Daily.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
