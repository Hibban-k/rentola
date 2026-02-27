import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    className = "",
}: PageHeaderProps) {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
