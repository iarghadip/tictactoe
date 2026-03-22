import { useState, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import './Enter.css';

export default function Enter({ open, title, fields, initialValues, onSubmit, onClose, loading, error }) {
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
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__title">{title}</div>
                {error && <p className="entry__error">{error}</p>}
                {fields.map((field, i) => (
                    <div className="entry__row" key={field.key}>
                        <input
                            className="entry__input"
                            type="text"
                            placeholder={field.placeholder || ''}
                            maxLength={field.maxLength || 20}
                            value={values[field.key] || ''}
                            onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            autoFocus={field.autoFocus && i === 0}
                        />
                    </div>
                ))}
                <button
                    className="entry__btn"
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                >
                    {loading ? '...' : <LoginIcon style={{ fontSize: 20 }} />}
                </button>
            </div>
        </div>
    );
}