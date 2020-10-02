// JavaScript source code

import React, { Component } from "react";
import csv from "csvtojson";
import request from "request";
import SearchIcon from '@material-ui/icons/Search';
import './Table.css'

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            json_data: [],
            filtered_data: [],
            searching: false,
            searchValue: '',
            sorting: false,
            filtering: false,
            genderToggle: false,
            categoryToggle: false,
            mediumToggle: false,
            genderFilters: [],
            categoryFilters: [],
            mediumFilters: []
        };
    }

    componentDidMount() {
        this.getDatafromUrl();

    }

    //function to get data in csv format and convert to json
    getDatafromUrl = async () => {
        let array = [];
        await csv({ delimiter: ["|"] })
            .fromStream(
                request.get(
                    "https://raw.githubusercontent.com/openbangalore/bangalore/master/bangalore/Education/Bangalore_schools.csv"
                )
            )
            .subscribe((json) => {
                return new Promise((resolve, reject) => {

                    resolve(array.push(json));
                    // long operation for each json e.g. transform / write into database.
                });
            });

        //remove first and last elemts since not needed
        array = array.splice(1, array.length - 2);
        this.setState({ json_data: array });

    }


    //set Search value in state
    setSearchValue = (event) => {
        this.setState({ searchValue: event.target.value });
    }


    //sets searching toggle to false
    removeSearch = () => {
        this.setState({ searching: false });
    }


    //when searchbutton is clicked
    onSearchClick = () => {
        let filtered_elements = this.getFilteredData('search')
        //stored the filtered elements
        this.setState({ filtered_data: filtered_elements, searching: true });
    }


    //when filter button is clicked
    onFilterClick = (event) => {
        let filtered_elements = this.getFilteredData('filter', event.target.name, event.target.id);
        this.setState({ filtered_data: filtered_elements, filtering: true });
        console.log(this.state.filtered_data);
    }

    getFilteredData = (action, filter_type, filter_value) => {
        let result;
        console.log(action + " " + filter_type + ' ' + filter_value)
        //check is searchvalue is not empty and if filtering is false
        if (this.state.searching === false && this.state.filtering === false) {

            if (action === 'search') {
                console.log('searching' + this.state.searching + this.state.filtering)
                let filtered_elements = this.state.json_data.filter(ele => {
                    //return data that match search criteria

                    return (ele.schoolname.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.address.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.schoolid.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.pincode.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.landmark.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.area.toLowerCase().includes(this.state.searchValue.toLowerCase()))
                    //console.log(ele.schoolname)

                })

                result = filtered_elements;
            }
            else if (action === 'filter') {
                console.log('Filtering')
                let filtered_elements = this.state.json_data.filter(ele => {
                    //return data that match search criteria

                    return (ele[filter_type] === filter_value)
                    //console.log(ele.schoolname)

                })
                result = filtered_elements;
                // console.log(result)
            }
            return result;
        }
        else {
            if (action === 'search') {
                // console.log('search2' + this.state.searching + this.state.filtering)
                let filtered_elements = this.state.filtered_data.filter(ele => {
                    //return data that match search criteria

                    return (ele.schoolname.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.address.toLowerCase().includes(this.state.searchValue.toLowerCase()) || ele.schoolid.toLowerCase().includes(this.state.searchValue.toLowerCase()))
                    //console.log(ele.schoolname)

                })

                result = filtered_elements;
            }
            else if (action === 'filter') {
                let filtered_elements = this.state.filtered_data.filter(ele => {
                    //return data that match search criteria

                    return (ele[filter_type] === filter_value)
                    //console.log(ele.schoolname)

                })
                result = filtered_elements;
            }
            return result;
        }
    }

    //method to display filter buttton of a specific category
    toggleFilter = (event) => {
        console.log(event.target.id);
        switch (event.target.id) {
            case 'gender': {
                let array = this.getPossibleFilters(event.target.id);
                //console.log(array);
                this.setState({ genderFilters: array, genderToggle: !this.state.genderToggle });
                break;
            }
            case 'category': {
                let array = this.getPossibleFilters(event.target.id);
                this.setState({ categoryFilters: array, categoryToggle: !this.state.categoryToggle });
                break;
            }
            case 'medium_of_inst': {
                let array = this.getPossibleFilters(event.target.id);
                this.setState({ mediumFilters: array, mediumToggle: !this.state.mediumToggle });
                break;
            }
            default:

        }
        console.log(this.state.genderFilters)
    }


    //Method to get all filter values after toggling a specific filter
    getPossibleFilters = (filter) => {
        let set = new Set();
        //if searching and filtering is false get data from original array
        if (this.state.searching === false && this.state.filtering === false) {
            for (let ele in this.state.json_data) {
                set.add(this.state.json_data[ele][filter])
            }
            //console.log(set);
            let array = [...set];
            return array;
        }
        else {
            //if either filtering or searching is true we get data from filtered array
            for (let ele in this.state.filtered_data) {
                set.add(this.state.filtered_data[ele][filter])
            }


            let array = [...set];
            //console.log(array);
            return array;
        }
    }


    getArray = () => {
        let array = [];
        if (this.state.searching === false && this.state.filtering === false) {
            array = this.state.json_data;
        }
        else {
            array = this.state.filtered_data;
        }
        return array;
    }

    //removes all filters
    removeFilters = () => {
        this.setState({ sorting: false, filtering: false, filtered_data: [] });
    }

    //sorts data based on filter and direction
    getSortedData = (filterType, direction) => {
        let sorted_data;
        let data = this.getArray();
        if (direction === 'up') {
            //sort in ascending
            sorted_data = data.sort((ele1, ele2) => {
                if (ele1[filterType] > ele2[filterType])
                    return 1;
                else
                    return -1
            })
        }
        else if (direction === 'down') {
            //sort in descending
            sorted_data = data.sort((ele1, ele2) => {
                if (ele1[filterType] < ele2[filterType])
                    return 1;
                else
                    return -1
            })
        }
        this.setState({ filtered_data: sorted_data, sorting: true });
    }


    render() {
        console.log(this.state.filtering + ' ' + this.state.searching);
        return (
            <>
                <div className="main-component">

                    <div className="buttons">

                        <div className="search">
                            <input placeholder='search' type='text' onChange={this.setSearchValue} />
                            <SearchIcon className="search-button" onClick={this.onSearchClick}>search</SearchIcon>
                        </div>

                        <button onClick={this.removeSearch}>remove search</button>

                        <button onClick={this.removeFilters}>remove filters</button>
                    </div>
                    <table>
                        <thead>
                            <tr>

                                <th>address<button id='address' name='up' onClick={(event) => this.getSortedData(event.target.id, event.target.name)}>⬆</button><button id='address' name='down' onClick={(event) => this.getSortedData(event.target.id, event.target.name)}>⬇</button></th>
                                <th>area</th>
                                <th>schoolname<button id='schoolname' name='up' onClick={(event) => this.getSortedData(event.target.id, event.target.name)}>⬆</button><button id='schoolname' name='down' onClick={(event) => this.getSortedData(event.target.id, event.target.name)}>⬇</button></th>
                                <th>pincode</th>
                                <th>schoolid</th>
                                <th>landmark</th>
                                <th>
                                    <button onClick={this.toggleFilter} id='gender'>gender</button>
                                    {this.state.genderToggle === true ?
                                        <div className="filter">
                                            {this.state.genderFilters.map(ele => {
                                                return <button className="filter" id={ele} name='gender' onClick={(event) => { this.onFilterClick(event) }}>{ele}</button>
                                            })}
                                        </div> : null
                                    }
                                </th>
                                <th>
                                    <button onClick={this.toggleFilter} id='category'>category</button>
                                    {this.state.categoryToggle === true ?
                                        <div className="filter">
                                            {this.state.categoryFilters.map(ele => {
                                                return <button className="filter" id={ele} name='category' onClick={(event) => { this.onFilterClick(event) }}>{ele}</button>
                                            })}
                                        </div> : null
                                    }
                                </th>
                                <th>
                                    <button onClick={this.toggleFilter} id='medium_of_inst'>medium_of_inst</button>
                                    {this.state.mediumToggle === true ?
                                        <div className="filter">
                                            {this.state.mediumFilters.map(ele => {
                                                return <button className="filter" id={ele} name='medium_of_inst' onClick={(event) => { this.onFilterClick(event) }}>{ele}</button>
                                            })}
                                        </div> : null
                                    }
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (this.state.filtering === false && this.state.searching === false && this.state.sorting === false) ?
                                    this.state.json_data.map(ele => {
                                        console.log('original data');
                                        return (
                                            <tr key={ele.schoolid}>
                                                <td>{ele.address}</td>
                                                <td>{ele.area}</td>
                                                <td>{ele.schoolname}</td>
                                                <td>{ele.pincode}</td>
                                                <td>{ele.schoolid}</td>
                                                <td>{ele.landmark}</td>
                                                <td>{ele.gender}</td>
                                                <td>{ele.category}</td>
                                                <td>{ele.medium_of_inst}</td>
                                            </tr>
                                        )
                                    })
                                    // console.log(this.state.searching+this.state.filtering);

                                    : this.state.filtered_data.map(ele => {
                                        console.log('rendering filtered data');
                                        return (
                                            <tr key={ele.schoolid}>
                                                <td>{ele.address}</td>
                                                <td>{ele.area}</td>
                                                <td>{ele.schoolname}</td>
                                                <td>{ele.pincode}</td>
                                                <td>{ele.schoolid}</td>
                                                <td>{ele.landmark}</td>
                                                <td>{ele.gender}</td>
                                                <td>{ele.category}</td>
                                                <td>{ele.medium_of_inst}</td>
                                            </tr>
                                        )
                                    })


                            }
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
}

export default Table;

