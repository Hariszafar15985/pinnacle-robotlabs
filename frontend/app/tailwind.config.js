module.exports = {
    // purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            screens: {
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                'xl+': '1440px',
                '2xl': '1536px',
                'full-hd': '1920px',
                '2k': '2560px'
            },
            colors: {
                "theme-gray": {
                    700: "#8096AD",
                    750: "#393D47",
                    800: "#2F3238",
                    900: "#21242B",
                    950: "#3c3d40",
                },
                "theme-blue": {
                    700: "#131679",
                    900: "#101C3D",
                    950: "#27283E",
                },
                "darker-grey": "#16131B",
                "dark-grey": "#1D1A21",
                "light-grey": "#535353",
                "brand-purple": "#140038",
                "light-black": "rgba(0,0,0,0.4)",
                "brand-blue": "#131679",
                "brand-bg": "#16131B",
                "grey-bg": "#2F3238",
                "brand-navy": "#263850",
                "brand-lime": "#CEDE3F"
            },
            fontSize: {
                xxs: ".6rem",
            },
            maxHeight: {
                "2/3-screen": "66.666667vh",
            },
            width: {
                "2/5-screen": "40vw",
            },
            height: {
                "30-percent-screen": "30vh",
                "2/5-screen": "40vh",
                "2/3-screen": "66.666667vh",
            },
            zIndex: {
                0: 0,
                5: 5,
                25: 25,
                100: 100,
                auto: "auto",
            },
            padding: {
                18: "4.5rem",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
