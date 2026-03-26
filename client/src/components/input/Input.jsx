import { useState, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/LoginTwoTone';
import SyncIcon from '@mui/icons-material/SyncTwoTone';
import { Button } from '../button';
import './Input.css';

export default function Input({
    open, title, fields, initialValues, onSubmit, onClose, loading, error
}) {
    const [values, setValues] = useState({});

    useEffect(() => {
        if (open) {
            const initial = {};
            fields.forEach(f => {
                initial[f.key] = (initialValues && initialValues[f.key] != null)
                    ? initialValues[f.key]
                    : '';
            });
            setValues(initial);
        }
    }, [open]);

    const handleKeyDown = (e) => {
        if (loading) return;
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onClose();
    };

    const handleSubmit = () => {
        if (loading) return;
        const primaryKey = fields[0]?.key;
        if (!(values[primaryKey] || '').trim()) return;
        onSubmit(values);
    };

    const handleBackdropClick = () => {
        if (loading) return;
        onClose();
    };

    const isValid = (values[fields[0]?.key] || '').trim().length > 0;

    if (!open) return null;

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center p-5 box-border input-backdrop"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="flex flex-col items-center gap-5 w-full max-w-[320px] p-8 px-6 box-border input"
            >
                <div className="text-center input__title">{title}</div>
                {error && <p className="text-center mt-[-8px] input__error">{error}</p>}
                {fields.map((field, i) => (
                    <div key={field.key} className={`flex items-center w-full rounded-full px-6 py-2 pl-6 box-border input__row ${loading ? 'input__row--locked' : ''}`}>
                        <input
                            className="flex-1 bg-transparent border-none outline-none"
                            type="text"
                            placeholder={field.placeholder || ''}
                            maxLength={field.maxLength || 15}
                            value={values[field.key] || ''}
                            onChange={e => {
                                if (loading) return;
                                setValues(v => ({ ...v, [field.key]: e.target.value }));
                            }}
                            onKeyDown={handleKeyDown}
                            autoFocus={(field.autoFocus !== false) && i === 0}
                            disabled={loading}
                            readOnly={loading}
                        />
                    </div>
                ))}
                <Button
                    onClick={handleSubmit}
                    icon={loading ? SyncIcon : LoginIcon}
                    disabled={!isValid || loading}
                    className={loading ? 'icon-spin' : ''}
                />
            </div>
        </div>
    );
}