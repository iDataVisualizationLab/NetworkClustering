var chart = c3.generate({
    data: {
        x : 'x',
        columns: [['x','250','500','750','1000'],
            ['Brandes', 14, 128, 480,1078],
            ['Virtual Node', 21, 154, 532, 121.874],
            ['Random Sampling', 24, 82, 189, 291]
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
 * Created by vinhtngu on 2/23/17.
 */
