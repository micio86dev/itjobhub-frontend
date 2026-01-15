
import { component$, useTask$, useSignal, PropFunction, noSerialize, NoSerialize, $, useOn, isBrowser } from '@builder.io/qwik';

interface JobLocation {
    id: string;
    title: string;
    companyName: string;
    companyLogo: string | null;
    salary: string | null;
    type: string | null;
    lat: number;
    lng: number;
}

interface Props {
    jobs: JobLocation[];
    onMarkerClick$?: PropFunction<(jobId: string) => void>;
}

export const JobMap = component$((props: Props) => {
    const mapContainerRef = useSignal<HTMLDivElement>();
    const map = useSignal<NoSerialize<GoogleMap> | null>(null);
    const markers = useSignal<NoSerialize<GoogleMarker>[]>([]);

    const updateMarkers = $(() => {
        if (!map.value) return;

        // Clear existing markers
        markers.value.forEach(m => m?.setMap(null));
        const newMarkers: GoogleMarker[] = [];

        props.jobs.forEach(job => {
            const marker = new window.google.maps.Marker({
                map: map.value as GoogleMap,
                position: { lat: job.lat, lng: job.lng },
                title: job.title,
                animation: window.google.maps.Animation.DROP
            });

            // Placeholder logic
            const logoHtml = job.companyLogo
                ? `<img src="${job.companyLogo}" alt="${job.companyName}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: contain; background: #fff; border: 1px solid #eee;">`
                : `<div style="width: 40px; height: 40px; border-radius: 4px; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif;">${job.companyName.charAt(0).toUpperCase()}</div>`;

            const typeBadge = job.type ? `<span style="background: #f3f4f6; color: #374151; font-size: 10px; padding: 2px 6px; border-radius: 99px; font-family: sans-serif;">${job.type}</span>` : '';
            const salaryHtml = job.salary ? `<div style="margin-top: 4px; font-size: 11px; color: #059669; font-weight: 500; font-family: sans-serif;">${job.salary}</div>` : '';

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                <div style="padding: 4px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
                    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 6px;">
                        ${logoHtml}
                        <div>
                            <h3 style="margin: 0; font-size: 14px; font-weight: bold; line-height: 1.2;">
                                <a href="/jobs/detail/${job.id}" target="_blank" style="text-decoration: none; color: #111827;">${job.title}</a>
                            </h3>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">${job.companyName}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                            ${typeBadge}
                    </div>
                    ${salaryHtml}
                    <div style="margin-top: 8px; text-align: right;">
                            <a href="/jobs/detail/${job.id}" target="_blank" style="font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 500;">Vedi Offerta &rarr;</a>
                    </div>
                </div>
            `
            });

            marker.addListener("click", () => {
                infoWindow.open({
                    anchor: marker,
                    map: map.value as GoogleMap,
                });
                if (props.onMarkerClick$) {
                    props.onMarkerClick$(job.id);
                }
            });

            newMarkers.push(marker);
        });

        markers.value = newMarkers.map(m => noSerialize(m));
    });

    const initMap = $(() => {
        if (!mapContainerRef.value || !window.google?.maps) return;

        if (!map.value) {
            const italyCenter = { lat: 41.8719, lng: 12.5674 };
            const newMap = new window.google.maps.Map(mapContainerRef.value, {
                center: italyCenter,
                zoom: 5,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });
            map.value = noSerialize(newMap);
        }

        updateMarkers();
    });

    useOn('qvisible', $(() => {
        const loadMap = () => {
            if (!mapContainerRef.value || typeof window === 'undefined') return;

            if (!window.google?.maps) {
                // Script should be loaded by layout or other components, but fallback check
                const scriptId = 'google-maps-script';
                if (!document.getElementById(scriptId)) {
                    const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
                    if (!apiKey) {
                        console.error("Missing Google Maps API Key");
                        return;
                    }
                    const script = document.createElement('script');
                    script.id = scriptId;
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                    script.async = true;
                    script.onload = () => initMap();
                    document.head.appendChild(script);
                } else {
                    // Wait for it
                    const i = setInterval(() => {
                        if (window.google?.maps) {
                            clearInterval(i);
                            initMap();
                        }
                    }, 100);
                }
                return;
            }
            initMap();
        };

        loadMap();
    }));

    useTask$(({ track }) => {
        track(() => props.jobs);
        if (isBrowser && map.value) {
            updateMarkers();
        }
    });

    return (
        <div ref={mapContainerRef} class="w-full h-[500px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700" />
    );
});
