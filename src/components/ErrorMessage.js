import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message }) => (
    <div className="flex-centralize-hor">
        <span className="error-message">{message}</span>
    </div>
)

ErrorMessage.propTypes = {
    message: PropTypes.any
}

export default ErrorMessage;