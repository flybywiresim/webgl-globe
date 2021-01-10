import "./Globe.scss";
import {useEffect, useState} from "react";
import {
    AmbientLight,
    Color, DirectionalLight,
    PerspectiveCamera,
    Renderer,
    Scene,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import ThreeGlobe from "three-globe";
import {Airport, Telex, TelexConnection} from "@flybywiresim/api-client";
import useInterval from "./hooks/useInterval";

export type GlobeProps = Partial<{
    refreshInterval: number,
    globeColor: string,
    arcColor: string,
    landColor: string,
    enableZoom: boolean,
    enableRotate: boolean,
    speedFactor: number,
}>

const Globe = (props: GlobeProps) => {
    const [mount, setMount] = useState<HTMLDivElement | null>();
    const [rendererState, setRender] = useState<Renderer>();
    const [globe, setGlobe] = useState<ThreeGlobe>();
    const [arcsData, setArcsData] = useState<any[]>([]);

    // Setup scene
    useEffect(() => {
        if (!mount) {
            return;
        }

        if (rendererState) {
            mount.removeChild(rendererState.domElement);
        }

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Scene
        const scene = new Scene();

        // Renderer
        const renderer = new WebGLRenderer({antialias: true, alpha: true});
        renderer.setClearColor("#fff", 0);
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);
        setRender(renderer);

        // Camera
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 220;

        // Camera Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 150;
        controls.maxDistance = 400;
        controls.enablePan = false;
        controls.enableZoom = props.enableZoom === undefined ? true : props.enableZoom;
        controls.enableRotate = props.enableRotate === undefined ? true : props.enableRotate;

        // Lights
        scene.add(new AmbientLight(0xbbbbbb));
        scene.add(new DirectionalLight(0xffffff, 0.3));

        const _globe = new ThreeGlobe();
        setGlobe(_globe);
        scene.add(_globe);

        let frameId = 0;
        const animate = () => {
            //ReDraw Scene with Camera and Scene Object
            _globe.rotation.y += 0.002 * (props.speedFactor !== undefined ? props.speedFactor : 1);

            renderScene();
            frameId = window.requestAnimationFrame(animate);
        };

        const startAnimation = () => {
            if (frameId === 0) {
                frameId = requestAnimationFrame(animate);
            }
        };

        const stopAnimation = () => {
            cancelAnimationFrame(frameId);
        };

        const renderScene = () => {
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };

        renderScene();
        startAnimation();
    }, [mount]);

    // Prepare globe
    useEffect(() => {
        if (!globe) {
            return;
        }

        const globeMaterial = globe.globeMaterial();
        globeMaterial.color = props.globeColor ? new Color(props.globeColor) : new Color("#152346");

        globe
            .arcColor("color")
            .arcDashLength(1.5)
            .arcDashGap(2)
            .arcStroke(0.5)
            .arcDashInitialGap(() => Math.random() * 3)
            .arcDashAnimateTime(2000)
            .arcsTransitionDuration(0);
        // .arcAltitudeAutoScale(0.2);

        fetch('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/hexed-polygons/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(async countries => {

                globe
                    .hexPolygonsData(countries.features)
                    .hexPolygonResolution(3)
                    .hexPolygonMargin(0.85)
                    .hexPolygonColor(() => props.landColor || "#fff");
            });
    }, [globe]);

    // Update flights
    useInterval(async () => {
        const fetchAirports = async (connections: TelexConnection[]) => {
            try {
                const airports = await Airport.getBatch(connections.flatMap(conn => [conn.origin, conn.destination]));

                return connections.map(conn => {
                    const origin = airports.find(arpt => arpt.icao === conn.origin);
                    const destination = airports.find(arpt => arpt.icao === conn.destination);

                    if (origin?.lon && destination?.lon) {
                        return {
                            startLat: origin.lat,
                            startLng: origin.lon,
                            endLat: destination.lat,
                            endLng: destination.lon,
                            color: props.arcColor || "#00C2CB",
                        };
                    } else {
                        return undefined;
                    }
                });
            } catch (e) {
                return [];
            }
        };

        try {
            const connections = await Telex.fetchAllConnections();
            setArcsData((await fetchAirports(connections)).filter(c => c !== undefined));
        } catch (e) {
            console.error(e);
        }
    }, props.refreshInterval || 180000, [], {runOnStart: true});

    // Draw flights
    useEffect(() => {
        if (!globe) {
            return;
        }

        globe.arcsData(arcsData || []);
    }, [arcsData, globe]);

    return (
        <div
            className={"render-target"}
            ref={mount => setMount(mount)}
        />
    );
};

export default Globe;
