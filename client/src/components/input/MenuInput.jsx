import { useState, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/LoginTwoTone';
import { RoundButton } from '../button';
import './MenuInput.css';

export default function MenuInput({
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
    }, [open, fields, initialValues]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onClose();
    };

    const handleSubmit = () => {
        const primaryKey = fields[0]?.key;
        if (!(values[primaryKey] || '').trim()) return;
        onSubmit(values);
    };

    const isValid = (values[fields[0]?.key] || '').trim().length > 0;

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-5 box-border menu-input-backdrop"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="flex flex-col items-center gap-5 w-full max-w-[320px] p-8 px-6 box-border menu-input"
            >
                <div className="text-center menu-input__title">{title}</div>
                {error && <p className="text-center mt-[-8px] menu-input__error">{error}</p>}
                {fields.map((field, i) => (
                    <div key={field.key} className="flex items-center w-full rounded-full px-6 py-2 pl-6 box-border menu-input__row">
                        <input
                            className="flex-1 bg-transparent border-none outline-none"
                            type="text"
                            placeholder={field.placeholder || ''}
                            maxLength={field.maxLength || 15} 
                            value={values[field.key] || ''}
                            onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            autoFocus={(field.autoFocus !== false) && i === 0} 
                        />
                    </div>
                ))}
                <RoundButton onClick={handleSubmit} icon={LoginIcon} disabled={!isValid || loading}/>
            </div>
        </div>
    );
}