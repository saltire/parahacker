var wireTypes = [
    // Straight
    {
        rows: 1,
        startRows: [0],
        endRows: {
            0: [0]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 4, 0, this.nodes[0]);
        }
    },

    // Dead end
    {
        rows: 1,
        startRows: [0],
        endRows: {},
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 3, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 3, 0);
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
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 1, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 1, 0);

            renderer.drawWireSegment(this, 0, 2, 1, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 4, 0, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 4, 2, this.nodes[1]);

            renderer.drawWireSegment(this, 0, 1, 2, this.nodes[2]);
            renderer.drawDeadEnd(this, 1, 2);

            renderer.drawSplitter(this, 2, 1);
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
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 2, 0);

            renderer.drawWireSegment(this, 0, 3, 1, this.nodes[1]);
            renderer.drawWireSegment(this, 3, 4, 0, this.nodes[1]);
            renderer.drawWireSegment(this, 3, 4, 2, this.nodes[1]);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);
            renderer.drawDeadEnd(this, 2, 2);

            renderer.drawSplitter(this, 3, 1);
        }
    },

    // Fork with a dead end on the top
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            2: [1]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 1, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 1, 0);

            renderer.drawWireSegment(this, 0, 2, 1, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 3, 0, this.nodes[1]);
            renderer.drawDeadEnd(this, 3, 0);
            renderer.drawWireSegment(this, 2, 4, 2, this.nodes[1]);

            renderer.drawWireSegment(this, 0, 1, 2, this.nodes[2]);
            renderer.drawDeadEnd(this, 1, 2);

            renderer.drawSplitter(this, 2, 1);
        }
    },

    // Fork with a dead end at the bottom
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            0: [1]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 1, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 1, 0);

            renderer.drawWireSegment(this, 0, 2, 1, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 4, 0, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 3, 2, this.nodes[1]);
            renderer.drawDeadEnd(this, 3, 2);

            renderer.drawWireSegment(this, 0, 1, 2, this.nodes[2]);
            renderer.drawDeadEnd(this, 1, 2);

            renderer.drawSplitter(this, 2, 1);
        }
    },

    // Reverse fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            1: [0, 2]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 1, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 1, 1);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 2, 4, 1, this.nodes[0] && this.nodes[2]);

            renderer.drawSplitter(this, 2, 1, true);
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
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 3, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 2, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 2, 1);

            renderer.drawWireSegment(this, 0, 3, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 3, 4, 1, this.nodes[0] && this.nodes[2]);

            renderer.drawSplitter(this, 3, 1, true);
        }
    },

    // Reverse fork with a dead end
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {},
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 1, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 1, 1);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 2, 3, 1, this.nodes[0] && this.nodes[2]);
            renderer.drawDeadEnd(this, 3, 1);

            renderer.drawSplitter(this, 2, 1, true);
        }
    },

    // Ring, or a fork followed by a reverse fork
    {
        rows: 3,
        startRows: [0, 1, 2],
        endRows: {
            1: [1]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 1, 0, this.nodes[0]);
            renderer.drawDeadEnd(this, 1, 0);

            renderer.drawWireSegment(this, 0, 2, 1, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 3, 0, this.nodes[1]);
            renderer.drawWireSegment(this, 2, 3, 2, this.nodes[1]);
            renderer.drawWireSegment(this, 3, 4, 1, this.nodes[1]);

            renderer.drawWireSegment(this, 0, 1, 2, this.nodes[2]);
            renderer.drawDeadEnd(this, 1, 2);

            renderer.drawSplitter(this, 2, 1);
            renderer.drawSplitter(this, 3, 1, true);
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
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 1, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 1, 1);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 2, 3, 1, this.nodes[0] && this.nodes[2]);
            renderer.drawWireSegment(this, 3, 4, 0, this.nodes[0] && this.nodes[2]);
            renderer.drawWireSegment(this, 3, 4, 2, this.nodes[0] && this.nodes[2]);

            renderer.drawSplitter(this, 2, 1, true);
            renderer.drawSplitter(this, 3, 1);
        }
    },

    // Reverse branching fork
    {
        rows: 4,
        startRows: [0, 1, 2, 3],
        endRows: {
            2: [0, 2, 3]
        },
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 1, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 1, 1);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 2, 3, 1, this.nodes[0] && this.nodes[2]);

            renderer.drawWireSegment(this, 0, 3, 3, this.nodes[3]);

            renderer.drawWireSegment(this, 3, 4, 2, this.nodes[0] && this.nodes[2] && this.nodes[3]);

            renderer.drawSplitter(this, 2, 1, true);
            renderer.drawSplitter(this, 3, 2, true);
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
        render: function (renderer) {
            renderer.drawWireSegment(this, 0, 2, 0, this.nodes[0]);

            renderer.drawWireSegment(this, 0, 1, 1, this.nodes[1]);
            renderer.drawDeadEnd(this, 1, 1);

            renderer.drawWireSegment(this, 0, 2, 2, this.nodes[2]);

            renderer.drawWireSegment(this, 2, 4, 1, this.nodes[0] && this.nodes[2]);

            renderer.drawSplitter(this, 2, 1, true);

            renderer.drawWireSegment(this, 0, 1, 3, this.nodes[3]);
            renderer.drawDeadEnd(this, 1, 3);

            renderer.drawWireSegment(this, 0, 2, 4, this.nodes[4]);
            renderer.drawWireSegment(this, 2, 3, 3, this.nodes[4]);
            renderer.drawWireSegment(this, 3, 4, 2, this.nodes[4]);
            renderer.drawWireSegment(this, 3, 4, 4, this.nodes[4]);
            renderer.drawWireSegment(this, 2, 4, 5, this.nodes[4]);

            renderer.drawWireSegment(this, 0, 1, 5, this.nodes[5]);
            renderer.drawDeadEnd(this, 1, 5);

            renderer.drawSplitter(this, 2, 4);
            renderer.drawSplitter(this, 3, 3);
        }
    }
];
