import React from 'react';
import {
  FaCalendarCheck,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaUserSlash,
} from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Booked':
        return {
          icon: <FaCalendarCheck size={12} />,
          className: 'status-badge Booked',
          label: 'Booked',
        };
      case 'Checked In':
        return {
          icon: <FaUserCheck size={12} />,
          className: 'status-badge CheckedIn',
          label: 'Checked In',
        };
      case 'Completed':
        return {
          icon: <FaCheckCircle size={12} />,
          className: 'status-badge Completed',
          label: 'Completed',
        };
      case 'Cancelled':
        return {
          icon: <FaTimesCircle size={12} />,
          className: 'status-badge Cancelled',
          label: 'Cancelled',
        };
      case 'No Show':
        return {
          icon: <FaUserSlash size={12} />,
          className: 'status-badge NoShow',
          label: 'No Show',
        };
      default:
        return {
          icon: null,
          className: 'status-badge',
          label: status,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={config.className}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

