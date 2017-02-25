var chart = c3.generate({
    data: {
        x : 'x',
        columns: [['x','250','500','750','1000'],
            ['Brandes', 14.550, 130, 120,235],
            ['Virtual Node', 21.717, 153.058, 535.127, 325.265],
            ['Random Sampling', 23.645, 82.322, 189.146, 70.681]
        ],
        type: 'bar'
    },
    axis: {
        y: {
            max:300,
            ticks : 15}},
    size: {
        width: 500

    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }

        // or
        //width: 100 // this makes bar width 100px
    }
});