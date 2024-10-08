import React from 'react';

type Props = {
    slot: number | bigint;
};

export function Slot({ slot }: Props) {
    return (
        <span className="font-mono">
            {slot.toLocaleString('en-US')}
        </span>
    );
}