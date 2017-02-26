var chart = c3.generate({
    data: {
        x : 'x',
        columns: [['x','250','500','750','1000'],
            ['Brandes', 4.356, 16.637, 44.490,94.430],
            ['Virtual Node', 8.461, 30.195, 75.712, 131.875],
            ['Random Sampling', 2.404, 4.326, 7.219, 9.746]
        ],
        type: 'bar'
    },

    size: {
        width: 700

    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }

        // or
        //width: 100 // this makes bar width 100px
    }
});/**
 * Created by vinhtngu on 2/22/17.
 */
