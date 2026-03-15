"use client"

import React, { useMemo } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

// TopoJSON for the world map
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

export interface GeoLocation {
    ip: string
    lat: number
    lon: number
}

interface IpMapProps {
    locations: GeoLocation[]
}

export function IpMap({ locations }: IpMapProps) {
    // Deduplicate locations so we don't draw 100 markers over the same IP city
    const uniqueLocations = useMemo(() => {
        console.log("IpMap rendering with locations:", locations);
        const map = new Map<string, GeoLocation>()
        for (const loc of locations) {
            if (!map.has(loc.ip)) {
                map.set(loc.ip, loc)
            }
        }
        return Array.from(map.values())
    }, [locations])

    return (
        <div className="w-full h-[400px] bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden">
            <ComposableMap
                projectionConfig={{
                    scale: 140,
                }}
                className="w-full h-full"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="hsl(var(--muted))"
                                stroke="hsl(var(--border))"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "hsl(var(--secondary))", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {/* Test Marker: London */}
                <Marker coordinates={[-0.1278, 51.5074]}>
                    <circle r={6} fill="red" />
                </Marker>

                {uniqueLocations.map(({ ip, lon, lat }) => (
                    <Marker key={ip} coordinates={[lon, lat]}>
                        <circle r={4} fill="red" opacity={0.8} />
                        <circle
                            r={12}
                            fill="red"
                            opacity={0.3}
                            className="animate-pulse"
                        />
                    </Marker>
                ))}
            </ComposableMap>
        </div>
    )
}
