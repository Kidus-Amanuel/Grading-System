import React from 'react';
import ReactDOM from 'react-dom';

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '500px',
};

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
};

export default function DeleteModal({ open, onClose, onConfirm }) {
    if (!open) return null;

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES} onClick={onClose} />
            <div style={MODAL_STYLES}>
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete this?</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ccc', border: 'none', borderRadius: '5px' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '5px' }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </>,
        document.getElementById('portal')
    );
}
