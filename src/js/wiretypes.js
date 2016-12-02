const wireTypes = [
    // Straight
    {
        rows: 1,
        startRows: [0],
        endRows: {
            0: [0]
        },
        weight: 10,
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 4, 0, wire.nodes[0]);
        }
    },

    // Dead end
    {
        rows: 1,
        startRows: [0],
        endRows: {},
        weight: 2,
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 3, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 3, 0);
        }
    },

    // Fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            0: [1],
            2: [1]
        },
        weight: 3,
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 1, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 1, 0);

            renderer.drawWireSegment(wire, 0, 2, 1, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 4, 0, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 4, 2, wire.nodes[1]);

            renderer.drawWireSegment(wire, 0, 1, 2, wire.nodes[2]);
            renderer.drawDeadEnd(wire, 1, 2);

            renderer.drawSplitter(wire, 2, 1);
        }
    },

    // Fork closer to the end
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            0: [1],
            2: [1]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 2, 0);

            renderer.drawWireSegment(wire, 0, 3, 1, wire.nodes[1]);
            renderer.drawWireSegment(wire, 3, 4, 0, wire.nodes[1]);
            renderer.drawWireSegment(wire, 3, 4, 2, wire.nodes[1]);

            renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);
            renderer.drawDeadEnd(wire, 2, 2);

            renderer.drawSplitter(wire, 3, 1);
        }
    },

    // Fork with a dead end on the top
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            2: [1]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 1, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 1, 0);

            renderer.drawWireSegment(wire, 0, 2, 1, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 3, 0, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 3, 0);
            renderer.drawWireSegment(wire, 2, 4, 2, wire.nodes[1]);

            renderer.drawWireSegment(wire, 0, 1, 2, wire.nodes[2]);
            renderer.drawDeadEnd(wire, 1, 2);

            renderer.drawSplitter(wire, 2, 1);
        }
    },

    // Fork with a dead end at the bottom
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            0: [1]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 1, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 1, 0);

            renderer.drawWireSegment(wire, 0, 2, 1, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 4, 0, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 3, 2, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 3, 2);

            renderer.drawWireSegment(wire, 0, 1, 2, wire.nodes[2]);
            renderer.drawDeadEnd(wire, 1, 2);

            renderer.drawSplitter(wire, 2, 1);
        }
    },

    // Reverse fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            1: [0, 2]
        },
        weight: 3,
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);

            renderer.drawWireSegment(wire, 0, 1, 1, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 1, 1);

            renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);

            renderer.drawWireSegment(wire, 2, 4, 1, wire.nodes[0] && wire.nodes[2]);

            renderer.drawSplitter(wire, 2, 1, true);
        }
    },

    // Reverse fork closer to the end
    {
        name: 'revfork2',
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            1: [0, 2]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 3, 0, wire.nodes[0]);

            renderer.drawWireSegment(wire, 0, 2, 1, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 2, 1);

            renderer.drawWireSegment(wire, 0, 3, 2, wire.nodes[2]);

            renderer.drawWireSegment(wire, 3, 4, 1, wire.nodes[0] && wire.nodes[2]);

            renderer.drawSplitter(wire, 3, 1, true);
        }
    },

    // // Reverse fork with a dead end
    // {
    //     rows: 3,
    //     startRows: [0, 1, 2],
    //     endRows: {},
    //     render(wire, renderer) {
    //         renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);
    //
    //         renderer.drawWireSegment(wire, 0, 1, 1, wire.nodes[1]);
    //         renderer.drawDeadEnd(wire, 1, 1);
    //
    //         renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);
    //
    //         renderer.drawWireSegment(wire, 2, 3, 1, wire.nodes[0] && wire.nodes[2]);
    //         renderer.drawDeadEnd(wire, 3, 1);
    //
    //         renderer.drawSplitter(wire, 2, 1, true);
    //     }
    // },

    // Ring, or a fork followed by a reverse fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            1: [1]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 1, 0, wire.nodes[0]);
            renderer.drawDeadEnd(wire, 1, 0);

            renderer.drawWireSegment(wire, 0, 2, 1, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 3, 0, wire.nodes[1]);
            renderer.drawWireSegment(wire, 2, 3, 2, wire.nodes[1]);
            renderer.drawWireSegment(wire, 3, 4, 1, wire.nodes[1]);

            renderer.drawWireSegment(wire, 0, 1, 2, wire.nodes[2]);
            renderer.drawDeadEnd(wire, 1, 2);

            renderer.drawSplitter(wire, 2, 1);
            renderer.drawSplitter(wire, 3, 1, true);
        }
    },

    // Reverse fork followed by a fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            0: [0, 2],
            2: [0, 2]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);

            renderer.drawWireSegment(wire, 0, 1, 1, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 1, 1);

            renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);

            renderer.drawWireSegment(wire, 2, 3, 1, wire.nodes[0] && wire.nodes[2]);
            renderer.drawWireSegment(wire, 3, 4, 0, wire.nodes[0] && wire.nodes[2]);
            renderer.drawWireSegment(wire, 3, 4, 2, wire.nodes[0] && wire.nodes[2]);

            renderer.drawSplitter(wire, 2, 1, true);
            renderer.drawSplitter(wire, 3, 1);
        }
    },

    // Reverse branching fork
    {
        rows: 4,
        startRows: [0, 1, 2, 3],
        endRows: {
            2: [0, 2, 3]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);

            renderer.drawWireSegment(wire, 0, 1, 1, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 1, 1);

            renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);

            renderer.drawWireSegment(wire, 2, 3, 1, wire.nodes[0] && wire.nodes[2]);

            renderer.drawWireSegment(wire, 0, 3, 3, wire.nodes[3]);

            renderer.drawWireSegment(wire, 3, 4, 2, wire.nodes[0] && wire.nodes[2] && wire.nodes[3]);

            renderer.drawSplitter(wire, 2, 1, true);
            renderer.drawSplitter(wire, 3, 2, true);
        }
    },

    // Reverse fork with a branching fork below it
    {
        rows: 6,
        startRows: [0, 1, 2, 3, 4, 5],
        endRows: {
            1: [0, 2],
            2: [4],
            4: [4],
            5: [4]
        },
        render(wire, renderer) {
            renderer.drawWireSegment(wire, 0, 2, 0, wire.nodes[0]);

            renderer.drawWireSegment(wire, 0, 1, 1, wire.nodes[1]);
            renderer.drawDeadEnd(wire, 1, 1);

            renderer.drawWireSegment(wire, 0, 2, 2, wire.nodes[2]);

            renderer.drawWireSegment(wire, 2, 4, 1, wire.nodes[0] && wire.nodes[2]);

            renderer.drawSplitter(wire, 2, 1, true);

            renderer.drawWireSegment(wire, 0, 1, 3, wire.nodes[3]);
            renderer.drawDeadEnd(wire, 1, 3);

            renderer.drawWireSegment(wire, 0, 2, 4, wire.nodes[4]);
            renderer.drawWireSegment(wire, 2, 3, 3, wire.nodes[4]);
            renderer.drawWireSegment(wire, 3, 4, 2, wire.nodes[4]);
            renderer.drawWireSegment(wire, 3, 4, 4, wire.nodes[4]);
            renderer.drawWireSegment(wire, 2, 4, 5, wire.nodes[4]);

            renderer.drawWireSegment(wire, 0, 1, 5, wire.nodes[5]);
            renderer.drawDeadEnd(wire, 1, 5);

            renderer.drawSplitter(wire, 2, 4);
            renderer.drawSplitter(wire, 3, 3);
        }
    }
];
