import React from 'react';
import { IconComponents } from './IconComponents';

const Modal = ({ children, title, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h2>{title}</h2>
                <button onClick={onClose} className="btn-icon"><IconComponents.CloseIcon /></button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

export default Modal;
