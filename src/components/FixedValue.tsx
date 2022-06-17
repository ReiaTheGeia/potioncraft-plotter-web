import React from "react";

export interface FixedValueProps {
  value: number;
  fixed?: number;
}

const FixedValue = ({ value, fixed = 2 }: FixedValueProps) => {
  return <span title={value.toString()}>{value.toFixed(fixed)}</span>;
};

export default FixedValue;
