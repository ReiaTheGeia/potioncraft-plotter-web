import React from "react";

import { Slider } from "@mui/material";

export interface IncDecSliderProps {
  className?: string;
  value: number;
  /**
   * The rate of change at maximum deflection in units per second.
   */
  rate: number;
  onChange(value: number): void;
  onChangeCommitted?(): void;
}

const IncDecSlider = ({
  className,
  value,
  rate,
  onChange,
  onChangeCommitted,
}: IncDecSliderProps) => {
  const [delta, setDelta] = React.useState(0);
  React.useEffect(() => {
    const token = setInterval(() => {
      if (delta === 0) {
        return;
      }

      const newValue = value + delta * rate * (1 / 10);
      onChange(newValue);
    }, 10);
    return () => clearInterval(token);
  }, [value, delta, rate]);

  return (
    <Slider
      className={className}
      min={-1}
      max={1}
      step={0.01}
      value={delta}
      onChange={(e, v) => {
        setDelta(v as number);
      }}
      onChangeCommitted={() => {
        setDelta(0);
        if (onChangeCommitted) {
          onChangeCommitted();
        }
      }}
    />
  );
};

export default IncDecSlider;
