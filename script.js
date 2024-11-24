const apiURL = 'https://data.nj.gov/resource/k9xb-zgh4.json';

fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        const groupedData = d3.rollup(
            data,
            (v) => v.length,
            (d) => d.county_name_common
        );

        const dataset = Array.from(groupedData, ([county, count]) => ({ county, count }));

        const svgWidth = 600;
        const svgHeight = 400;
        const margin = { top: 20, right: 30, bottom: 60, left: 50 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const svg = d3.select('body')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(dataset.map(d => d.county))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.count)])
            .range([height, 0]);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-30)')
            .style('text-anchor', 'end');

        svg.append('g')
            .call(d3.axisLeft(y));

        const tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('border', '1px solid black')
            .style('padding', '5px')
            .style('border-radius', '5px')
            .style('display', 'none');

        svg.selectAll('.bar')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.county))
            .attr('y', d => y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.count))
            .attr('fill', 'lightblue')
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget).attr('fill', 'orange');
                tooltip
                    .style('display', 'block')
                    .html(`<strong>${d.county}</strong><br>Cities: ${d.count}`);
            })
            .on('mousemove', (event) => {
                tooltip
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 20}px`);
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget).attr('fill', 'lightblue');
                tooltip.style('display', 'none');
            });

    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
