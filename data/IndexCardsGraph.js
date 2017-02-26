/**
 * Created by vinhtngu on 2/22/17.
 */
var chart = c3.generate({
    data: {
        x : 'x',
        columns: [['x','250','500','750','1000'],
            ['Brandes', 3.177, 15.687, 40.589,88.687],
            ['Virtual Node', 3.690, 24.571, 54.87, 121.874],
            ['Random Sampling', 3.889, 18.148, 23.686, 39.431]
        ],
        type: 'bar'
    },
    axis: {
        y: {
            max: 140

        }
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
});