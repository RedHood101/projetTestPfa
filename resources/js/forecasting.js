
 TimeSeriesAnalyseAlgo = function (response,y,q) {

     var mapQ1 = new Map();
     var mapQ2 = new Map();
     var mapQ3 = new Map();
     var mapQ4 = new Map();
     var lastYear = 0;
     dataAll =[];
     axios.get('/season_data').then(function (response) {
         response.data.forcastingData.forEach(function (Data) {
             dataAll.push(Data.count);
             if (Data.month <= 3) {
                 if (mapQ1.has(Data.year)) {
                     mapQ1.set(Data.year, mapQ1.get(Data.year) + Data.count)
                 } else {
                     mapQ1.set(Data.year, Data.count)
                 }
             } else if (Data.month <= 6) {
                 if (mapQ2.has(Data.year)) {
                     mapQ2.set(Data.year, mapQ2.get(Data.year) + Data.count)
                 } else {
                     mapQ2.set(Data.year, Data.count)
                 }
             } else if (Data.month <= 9) {
                 if (mapQ3.has(Data.year)) {
                     mapQ3.set(Data.year, mapQ3.get(Data.year) + Data.count)
                 } else {
                     mapQ3.set(Data.year, Data.count)
                 }
             } else {
                 if (mapQ4.has(Data.year)) {
                     mapQ4.set(Data.year, mapQ4.get(Data.year) + Data.count)
                 } else {
                     mapQ4.set(Data.year, Data.count)
                 }
             }
             lastYear = Math.max(Data.year, lastYear);
         });


         Q1k = Array.from(mapQ1.keys());
         Q2k = Array.from(mapQ2.keys());
         Q3k = Array.from(mapQ3.keys());
         Q4k = Array.from(mapQ4.keys());

         keys = [Q1k, Q2k, Q3k, Q4k];

         number_years = Math.max(Q1k.length, Q2k.length, Q3k.length, Q4k.length);
         number_season = 4;

         var key = 0;
         for (let i = 0; i < 4; i++) {
             if (keys[i].length === number_years) {
                 key = i;
                 break
             }
         }


         maps = [mapQ1, mapQ2, mapQ3, mapQ4];

         for (let i = 0; i < number_season; i++) {
             for (let j = 0; j < number_years; j++) {
                 if (!maps[i].has(keys[key][j])) {
                     maps[i].set(keys[key][j], 0)

                 }
             }
         }


         Q1 = Array.from(maps[0].values());
         Q2 = Array.from(maps[1].values());
         Q3 = Array.from(maps[2].values());
         Q4 = Array.from(maps[3].values());

         tableDataForEachSeason = [Q1, Q2, Q3, Q4];

        // console.log(tableDataForEachSeason);

         totalData = number_season * number_years;
         xcode = [];
         for (let i = 0; i < totalData; i++) {
             xcode.push(i);
         }

         Y = [];
         for (let i = 0; i < number_years; i++) {
             for (let j = 0; j < number_season; j++) {
                 Y.push(tableDataForEachSeason[j][i]);
             }
         }

         console.log(Y);

         fourQMean = [];
         for (let i = 0; i < totalData - 3; i++) {
             fourQMean.push((Y[i] + Y[i + 1] + Y[i + 2] + Y[i + 3]) / 4);
         }

         centerAverge = [];
         centerAvergeLength = fourQMean.length - 1;
         for (let i = 0; i < centerAvergeLength; i++) {
             centerAverge.push((fourQMean[i] + fourQMean[i + 1]) / 2);
         }

         pourcentOfAverge = [];
         for (let i = 0; i < centerAvergeLength; i++) {
             pourcentOfAverge.push((centerAverge[i] / Y[i + 2]) * 100);
         }


         quartile1 = [];
         quartile2 = [];
         quartile3 = [];
         quartile4 = [];

         for (let i = 0; i < centerAvergeLength; i++) {
             if (i % 4 === 0) {
                 quartile4.push(pourcentOfAverge[i]);
             } else if (i % 4 === 1) {
                 quartile3.push(pourcentOfAverge[i]);
             } else if (i % 4 === 2) {
                 quartile2.push(pourcentOfAverge[i]);
             } else {
                 quartile1.push(pourcentOfAverge[i]);
             }
         }

         meanQ1 = 0;
         for (let i = 0; i < quartile1.length; i++) {
             meanQ1 += quartile1[i];
         }
         meanQ1 /= quartile1.length;

         meanQ2 = 0;
         for (let i = 0; i < quartile2.length; i++) {
             meanQ2 += quartile2[i];
         }
         meanQ2 /= quartile2.length;

         meanQ3 = 0;
         for (let i = 0; i < quartile3.length; i++) {
             meanQ3 += quartile3[i];
         }
         meanQ3 /= quartile3.length;

         meanQ4 = 0;
         for (let i = 0; i < quartile4.length; i++) {
             meanQ4 += quartile4[i];
         }
         meanQ4 /= quartile4.length;

         seasonalIndexs = [meanQ1, meanQ2, meanQ3, meanQ4];
         sumMeanQuartile = meanQ1 + meanQ2 + meanQ3 + meanQ4;


         adjusementFactor = 0;
         if (sumMeanQuartile !== 400) {
             adjusementFactor = 400 / sumMeanQuartile;
             for (let i = 0; i < 4; i++) {
                 seasonalIndexs[i] *= adjusementFactor;
             }
         }

         // season index for each quartile
         console.log(seasonalIndexs);

         // Y = aX +b
         Ybar = 0;
         ySum = 0;
         for (let i = 0; i < Y.length; i++) {
             ySum += Y[i];
         }
         Ybar = ySum / Y.length;

         Xbar = 0;
         xSum = 0;
         xSumSquare = 0;
         for (let i = 0; i < xcode.length; i++) {
             xSum += xcode[i];
             xSumSquare += xcode[i] ^ 2;
         }
         Xbar = xSum / xcode.length;

         xySum = 0;
         for (let i = 0; i < totalData; i++) {
             xySum += xcode[i] * Y[i];
         }

         //b = Ybar - Xbar*a
         //a = (n*sum(xy)-sum(x)sum(y))/(n*sum(x^2)-sum(x)^2)

         coefficient = (totalData * xySum - xSum * ySum) / (totalData * xSumSquare - xSum * xSum);
         intercept = Ybar - Xbar * coefficient;

         console.log(coefficient + "," + intercept);


         YEARS =[];
         PREDICTIONS=[];
         for (let i = lastYear+1; i <= y; i++) {
             YEARS.push(i);
             expX = (i-lastYear-1)*4+q+totalData;
             expX2 = (i+1-lastYear-1)*4+q+totalData;
             PREDICTIONS.push(((coefficient*expX2 + intercept) * seasonalIndexs[q-1]/100)-((coefficient*expX + intercept) * seasonalIndexs[q-1]/100));
         }

         expectedX = (y-lastYear-1)*4+q+totalData;
         expectedSales = (coefficient*expectedX + intercept) * seasonalIndexs[q-1]/100;

         // display in view
         var rs = document.getElementById('result');
         rs.innerHTML = parseInt(expectedSales);
         rs.style.Color = "1DFFDD";

         var area = document.getElementById('ctxA');
         var area2 = document.getElementById('ctxF');

         new Chart(area, {
             type: 'line',
             data: {
                 labels: YEARS,
                 datasets: [{
                     label: '# orders',
                     data: PREDICTIONS,
                 }]
             }
         });

     });
 };
getPredictions = function (y,q) {
    axios.get('/season_data').then(function (response) {
        return TimeSeriesAnalyseAlgo(response,y,q);
    });
};

predict = function () {
 var yr = document.getElementById('years');
 var qr = document.getElementById('quarters');

 var optY = yr.options[yr.selectedIndex].value;
 var optQ = qr.options[qr.selectedIndex].value;

getPredictions(optY,optQ);

 };

