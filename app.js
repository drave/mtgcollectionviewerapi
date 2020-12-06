const express = require("express");
const app = express();
const cors = require('cors');
const fs = require('fs');
const Papa = require("papaparse");
const matchAll = require("match-all");

fs.readFile('cards2.csv', 'utf8', function(err, fileData) {
    if (err) throw err;

    let rows = fileData.split("\n");
    let headers = rows.shift();

    headers = headers.replace('Total Qty', 'total_qty');
    headers = headers.replace('Reg Qty', 'reg_qty');
    headers = headers.replace('Foil Qty', 'foil_qty');
    headers = headers.replace('Card', 'card');
    headers = headers.replace('Set', 'set');
    headers = headers.replace('Mana Cost', 'mana_cost');
    headers = headers.replace('Card Type', 'card_type');
    headers = headers.replace('Color', 'color');
    headers = headers.replace('Rarity', 'rarity');
    headers = headers.replace('Mvid', 'mvid');
    headers = headers.replace('Single Price', 'single_price');
    headers = headers.replace('Single Foil Price', 'single_foil_price');
    headers = headers.replace('Total Price', 'total_price');
    headers = headers.replace('Price Source', 'price_source');
    headers = headers.replace('Notes', 'notes');
    headers = headers.replace("Trend", "trend");
    headers = headers.replace("Sell", "sell");
    headers = headers.replace("Low", "low");
    headers = headers.replace("Foil trend", "foil_trend");
    headers = headers.replace("Foil low", "foil_low");
    rows = rows.map(row => row.replace(/""/g, '&quot;')).filter(l => l !== '');
    const csvData = [headers, ...rows].join("\n");
    const json = Papa.parse(csvData, {
        delimiter: ",",
        newline: "\n",
        header: true,
    });

    const replaceMana = (mana) => {
        let costs = mana;
        if (costs) {
            costs = parseFloat(costs.replace(/[^0-9]/g, ''));
            if (isNaN(costs)) {
                costs = 0;
            }
        } else {
            return -1;
        }

        if (mana.match(/\{([A-Z]{1})\/([A-Z]{1})\}/g)) {
            //mana = mana.replace(/\{([A-Z]{1})\/([A-Z]{1})\}/g, '<span class="mtg-color mtg-color--$1$2"></span>');
            const matches = matchAll(mana, /\{([A-Z]{1}\/[A-Z]{1})\}/g).toArray();

            costs += 7000;
            let increments = {};
            matches.forEach(m => {
                if (m === 'W/U' || m === 'U/W') {
                    if (! increments['WU']) {
                        costs += 100;
                    }

                    increments['WU'] = true;
                    costs++;
                }
                if (m === 'W/B' || m === 'B/W') {
                    if (! increments['WB']) {
                        costs += 200;
                    }

                    increments['WB'] = true;
                    costs++;
                }
                if (m === 'U/B' || m === 'B/U') {
                    if (! increments['UB']) {
                        costs += 300;
                    }

                    increments['UB'] = true;
                    costs++;
                }
                if (m === 'U/R' || m === 'R/U') {
                    if (! increments['UR']) {
                        costs += 400;
                    }

                    increments['UR'] = true;
                    costs++;
                }
                if (m === 'B/R' || m === 'R/B') {
                    if (! increments['BR']) {
                        costs += 500;
                    }

                    increments['BR'] = true;
                    costs++;
                }
                if (m === 'B/G' || m === 'G/B') {
                    if (! increments['BG']) {
                        costs += 600;
                    }

                    increments['BG'] = true;
                    costs++;
                }
                if (m === 'R/W' || m === 'W/R') {
                    if (! increments['RW']) {
                        costs += 700;
                    }

                    increments['RW'] = true;
                    costs++;
                }
                if (m === 'R/G' || m === 'G/R') {
                    if (! increments['RG']) {
                        costs += 800;
                    }

                    increments['RG'] = true;
                    costs++;
                }
                if (m === 'G/W' || m === 'W/G') {
                    if (! increments['GW']) {
                        costs += 900;
                    }

                    increments['GW'] = true;
                    costs++;
                }
                if (m === 'G/U' || m === 'U/G') {
                    if (! increments['GU']) {
                        costs += 1000;
                    }

                    increments['GU'] = true;
                    costs++;
                }
            })

        } else if (mana.match(/P\}/g)) {
            //mana = mana.replace(/\{([A-Z]{1,2})\}/g, '<span class="mtg-color mtg-color--$1"></span>');
            const matches = matchAll(mana, /\{([A-Z]?P)\}/g).toArray();
            costs += 10000;
            let increments = {};

            matches.forEach(m => {
                if (m === 'WP') {
                    if (! increments['WP']) {
                        costs += 100;
                    }

                    increments['WP'] = true;
                    costs++;
                }
                if (m === 'UP') {
                    if (! increments['UP']) {
                        costs += 200;
                    }

                    increments['UP'] = true;
                    costs++;
                }
                if (m === 'RP') {
                    if (! increments['RP']) {
                        costs += 300;
                    }

                    increments['RP'] = true;
                    costs++;
                }
                if (m === 'GP') {
                    if (! increments['GP']) {
                        costs += 400;
                    }

                    increments['GP'] = true;
                    costs++;
                }
                if (m === 'BP') {
                    if (! increments['BP']) {
                        costs += 500;
                    }

                    increments['BP'] = true;
                    costs++;
                }
                if (m === 'P') {
                    if (! increments['P']) {
                        costs += 600;
                    }

                    increments['P'] = true;
                    costs++;
                }
            });

        } else {
            let colors = mana.replace(/[^A-Z]/g, '');
            let increments = {};
            let countColors = [];
            [...colors].forEach(c => {
                if (c === 'C') {
                    if (! increments['C']) {
                        costs += 100;
                    }

                    countColors.push('C');
                    increments['C'] = true;
                    costs++;
                }
                if (c === 'W') {
                    if (! increments['W']) {
                        costs += 200;
                    }

                    countColors.push('W');
                    increments['W'] = true;
                    costs++;
                }
                if (c === 'U') {
                    if (! increments['U']) {
                        costs += 300;
                    }

                    countColors.push('U');
                    increments['U'] = true;
                    costs++;
                }
                if (c === 'B') {
                    if (! increments['B']) {
                        costs += 400;
                    }

                    countColors.push('B');
                    increments['B'] = true;
                    costs++;
                }
                if (c === 'R') {
                    if (! increments['R']) {
                        costs += 500;
                    }

                    countColors.push('R');
                    increments['R'] = true;
                    costs++;
                }
                if (c === 'G') {
                    if (! increments['G']) {
                        costs += 600;
                    }

                    countColors.push('G');
                    increments['G'] = true;
                    costs++;
                }
                if (c === 'S') {
                    if (! increments['S']) {
                        costs += 700;
                    }

                    countColors.push('S');
                    increments['S'] = true;
                    costs++;
                }
                if (c === 'X') {
                    costs++;
                }
            })

            countColors = [...new Set(countColors)];

            costs += countColors.length * 1000;
        }

        return costs;
    }

    const calculatePrice = (row) => {
        const newRow = row;
        let totalTrend = 0;
        let totalLow = 0;
        if (row.trend > 0) {
            newRow.price_trend = parseFloat(row.trend);
            if (row.reg_qty > 0) {
                totalTrend += row.reg_qty * parseFloat(row.trend);
            }
        }
        if (row.sell > 0) {
            newRow.price_average = parseFloat(row.sell);
        }
        if (row.low > 0) {
            newRow.price_low = parseFloat(row.low);
            if (row.reg_qty > 0) {
                totalLow += row.reg_qty * parseFloat(row.low);
            }
        }

        if (row.foil_trend > 0) {
            newRow.price_foil_trend = parseFloat(row.foil_trend);
            if (row.foil_qty > 0) {
                totalTrend += row.foil_qty * parseFloat(row.foil_trend);
            }
        }
        if (row.foil_low > 0) {
            newRow.price_foil_low = parseFloat(row.foil_low);
            if (row.foil_qty > 0) {
                totalLow += row.foil_qty * parseFloat(row.foil_low);
            }
        }

        if (totalTrend > 0) {
            newRow.total_trend = parseFloat(totalTrend.toFixed(2));
        }
        if (totalLow > 0) {
          newRow.total_low = parseFloat(totalLow.toFixed(2));
        }

        return newRow;
    }

    let data = json.data;

    let totalTrend = 0;
    let totalLow = 0;

    data = data.map(c => {
        c['mana'] = replaceMana(c.mana_cost)
        c = calculatePrice(c);
        if (c.total_trend) {
            totalTrend += c.total_trend;
        }
        if (c.total_low) {
          totalLow += c.total_low;
        }
        return c;
    })

    const sortCards = (cards, sortingPriority) => {
        if (sortingPriority.length <= 0) {
           return cards;
        }

        let formattedSortingPriority = sortingPriority.map((i) => {
            return (i.order && i.order === 'desc' ? '-' : '') + i.field
        })

        const fieldSorter = (fields) => (a, b) => fields.map((o) => {
            let dir = 1
            if (o[0] === '-') {
                dir = -1;
                o = o.substring(1)
            }

            if (
              o === "reg_qty" ||
              o === "foil_qty" ||
              o === "price_trend" ||
              o === "price_average" ||
              o === "price_low" ||
              o === "price_foil_trend" ||
              o === "price_foil_low" ||
              o === "total_trend" ||
              o === "total_low"
            ) {
              return dir === 1
                ? parseFloat(a[o]) - parseFloat(b[o])
                : parseFloat(b[o]) - parseFloat(a[o]);
            }

            if (o === 'mana_cost') {
                const left = a['mana'];
                const right = b['mana'];

                return dir === 1 ? left - right : right - left;
            }

            return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0
        }).reduce((p, n) => p || n, 0)

        return cards.sort(fieldSorter(formattedSortingPriority))
    }

    const filterCards = (cards, filters) => {
        for (const [key, value] of Object.entries(filters)) {
            const searchValue = value.trim();

            if (searchValue === '') {
                continue;
            }

            cards = cards.filter(c => {
                const words = searchValue.split(' ');
                let matches = false;

                words.forEach(w => {
                    const pattern = `${w}`;
                    const reg = new RegExp(pattern, 'gi');
                    if (c[key].match(reg)) {
                        matches = true;
                    }
                })

                return matches;
            })
        }

        return cards;
    }

    const getCards = (req) => {
        const page = req.query.page || 1;
        const filters = JSON.parse(req.query.filters || '{}');
        const sortBy = JSON.parse(req.query.sort_by || '[]');
        const filteredData = filterCards(data, filters);
        const total = filteredData.length;

        return {
            results: sortCards(filteredData, sortBy).slice(((page - 1) * 100), (page * 100)),
            totals: {
                totalTrend: totalTrend.toFixed(2),
                totalLow: totalLow.toFixed(2)
            },
            total_results: total
        }
    }

    app.use(cors())

    app.get("/cards", (req, res, next) => {
        res.json(getCards(req));
    });

    app.listen((process.env.PORT || 3000), () => {
        console.log("Server running on port " + (process.env.PORT || 3000));
    });
});


