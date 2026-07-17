import React from 'react';

export default function Barcode({ value }) {
    const seed = String(value).split('').map((char) => char.charCodeAt(0));
    const bars = Array.from({ length: 46 }, (_, index) => {
        const width = ((seed[index % seed.length] + index) % 3) + 1;
        const height = ((seed[index % seed.length] + index) % 5) > 1 ? 'h-11' : 'h-8';
        return { width, height };
    });

    return (
        <div className="flex h-14 items-end justify-center gap-[2px] border-y border-black py-1">
            {bars.map((bar, index) => (
                <span
                    key={index}
                    className={`block bg-black ${bar.height}`}
                    style={{ width: `${bar.width}px` }}
                />
            ))}
        </div>
    );
}
