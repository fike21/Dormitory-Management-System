import React from 'react';

const Form = ({ title, children, onSubmit }) => {
  return (
    <div className="glass" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{title}</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {children}
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
          Confirm Action
        </button>
      </form>
    </div>
  );
};

export default Form;
