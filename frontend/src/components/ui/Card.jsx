import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_18px_40px_rgba(112,144,176,0.12)] ${noPadding ? '' : 'p-6 sm:p-8'} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
