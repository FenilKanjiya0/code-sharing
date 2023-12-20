import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import AddIcon from '@material-ui/icons/Add'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import { withStyles } from '@material-ui/styles'
import _ from 'lodash'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import TablePagination from '@material-ui/core/TablePagination'
import getAllWOs from 'Services/WorkOrder/getAllWOs'
import deleteWO from 'Services/WorkOrder/deleteWO'
import enums from 'Constants/enums'
import { history } from 'helpers/history'
import CreateAccWO from './CreateAccWO'
import { MinimalFilterSelector } from '../Assets/components'
import DialogPrompt from 'components/DialogPrompt'
import { StatusComponent, DropDownMenu, StatusSelectPopup } from 'components/common/others'
import { Toast } from 'Snackbar/useToast'
import { getFormatedDate } from 'helpers/getDateTime'
import { workOrderTypesPath } from './utils'
import { ActionButton } from 'components/common/buttons'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'
import { get } from 'lodash'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'

const styles = theme => ({
  tableCell: { fontSize: '12px', fontWeight: 400 },
  headRoot: { cursor: 'pointer', '&:hover': { background: '#e0e0e0 !important' } },
  headFilter: { paddingRight: 0 },
  listbox: {
    fontSize: 12,
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
  },
  LoadingWrapper: { fontSize: 12 },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
      fontSize: '12px',
    },
  },
  input: { fontSize: '12px !important' },
  autoInput: { width: '100%' },
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white' },
})

export class WorkOrderList extends Component {
  constructor(props) {
    super(props)
    this.STATUS_ENUMS = [
      { value: [], label: 'All' },
      { value: [72], label: 'Planned' },
      { value: [73, 13, 69], label: 'Released Open | In Progress | Hold' },
      { value: [15], label: 'Completed' },
    ]
    this.PRIORITY_ENUMS = [
      { id: 45, value: 'Low' },
      { id: 46, value: 'Medium' },
      { id: 47, value: 'High' },
    ]
    this.state = {
      loading: true,
      rows: [],
      pageSize: 20,
      pageIndex: 1,
      rowsPerPage: 20,
      page: 0,
      searchString: '',
      size: 0,
      filterForColumn: false,
      clearFilterButton: true,
      statusFilter: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
      typeFilter: null,
      accWOOpen: false,
      type: 66,
      workorderToDelete: {},
      isDeleteWorkorderOpen: false,
      deleteLoading: false,
      resetBtnClicked: false,
      isExportLoading: false,
    }
    this.dropDownMenuOptions = [
      {
        id: 1,
        type: 'button',
        text: 'Acceptance Test',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.Acceptance }),
        show: true,
      },
      {
        id: 2,
        type: 'button',
        text: 'Maintenance',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.Maintainance }),
        show: true,
      },
      {
        id: 3,
        type: 'button',
        text: 'Onboarding',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.OnBoarding }),
        show: true,
      },
      {
        id: 4,
        type: 'button',
        text: 'Infrared Scan',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.InfraredScan }),
        show: true,
      },
    ]
  }
  //
  async componentDidMount() {
    if (history.action === 'PUSH') {
      this.setState({
        statusFilter: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
        rowsPerPage: _.get(history, 'location.state.pageRows', 20),
        searchString: _.get(history, 'location.state.search', ''),
        pageIndex: _.get(history, 'location.state.pageIndex', 1),
        page: _.get(history, 'location.state.pageIndex', 1) - 1,
      })
    }
    const payload = {
      pageindex: history.action === 'PUSH' ? _.get(history, 'location.state.pageIndex', 1) : 1,
      pagesize: history.action === 'PUSH' ? _.get(history, 'location.state.pageRows', 20) : 20,
      search_string: history.action === 'PUSH' ? _.get(history, 'location.state.search', '') : ' ',
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
      wo_type: [],
      site_id: [],
    }
    this.filterRequests(payload)
  }
  //
  SearchControl = () => (
    <div>
      <TextField
        placeholder='Search Work Orders'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchOutlined color='primary' />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment className='pointerCursor' position='end' onClick={e => this.setState({ searchString: '', page: 0, pageIndex: 1 }, () => this.constructRequestPayload())}>
              {this.state.searchString ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
            </InputAdornment>
          ),
        }}
        value={this.state.searchString}
        onChange={e => this.setState({ searchString: e.target.value })}
        onKeyDown={e => this.handleSearchOnKeyDown(e)}
      />
    </div>
  )
  HeaderTab = ({ classes, text, filter, cond }) => (
    <TableCell align='left' padding='normal' style={{ background: '#fafafa', fontWeight: 800 }}>
      {text}
      {filter && <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />}
    </TableCell>
  )
  HearderControl = ({ classes, filterOptions }) => (
    <TableHead>
      <TableRow>
        {this.HeaderTab({ classes, text: 'WO Number' })}
        {this.HeaderTab({ classes, text: 'Work Type' })}
        {this.HeaderTab({ classes, text: 'Facility' })}
        {this.HeaderTab({ classes, text: 'Start Date' })}
        {this.HeaderTab({ classes, text: 'Due In' })}
        {this.HeaderTab({ classes, text: 'Status' })}
        {this.HeaderTab({ classes, text: 'Actions' })}
      </TableRow>
    </TableHead>
  )
  getWorkOrderStatus = status => {
    const { color, label } = enums.WO_STATUS.find(d => d.value === status)
    return <StatusComponent label={label} color={color} size='small' />
  }
  getWorkOrderDueIn = d => {
    if (!d.due_date && enums.PM.STATUS.COMPLETED !== d.wo_status_id) return 'NA'
    const label = enums.PM.STATUS.COMPLETED !== d.wo_status_id ? d.due_in : 'Completed'
    if (enums.PM.STATUS.COMPLETED === d.wo_status_id) return ''

    return d.is_overdue || d.due_in === 'Due' ? <StatusComponent color={getDueInColor(d.due_in === 'Due' ? 2 : -1)} label={label} size='small' filled /> : label
  }
  //
  // checkClearFilterDisablity = () => (this.state.statusFilter !== null || this.state.typeFilter !== null ? this.setState({ clearFilterButton: false, filterForColumn: true }) : this.setState({ clearFilterButton: true, filterForColumn: false }))
  checkClearFilterDisablity = () => (this.state.statusFilter.length === 0 ? this.setState({ clearFilterButton: true }) : this.setState({ clearFilterButton: false }))
  clearFilters = () => this.setState({ typeFilter: null, resetBtnClicked: true, statusFilter: [] }, () => this.constructRequestPayload())

  constructRequestPayload = () => {
    const payload = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      search_string: this.state.searchString,
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: this.state.statusFilter,
      wo_type: this.state.typeFilter ? [this.state.typeFilter.value] : [],
      site_id: [],
    }
    this.filterRequests(payload)
    this.setState({ resetBtnClicked: false })
  }

  filterRequests = async payload => {
    this.setState({ loading: true })
    try {
      const res = await getAllWOs(payload)
      // console.log(res.data.list)
      if (!_.isEmpty(res.data)) this.successInFetchingData(res.data)
      else this.failureInFetchingData()
    } catch (error) {
      this.failureInFetchingData()
    }
  }
  successInFetchingData = data => this.setState({ loading: false, rows: data.list, size: data.listsize }, () => this.checkClearFilterDisablity())
  failureInFetchingData = () => this.setState({ loading: false, rows: [], size: 0 }, () => this.checkClearFilterDisablity())
  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ page: 0, pageIndex: 1 }, () => this.constructRequestPayload())
  //
  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.constructRequestPayload())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.constructRequestPayload())

  deleteWorkOrder = async () => {
    this.setState({ deleteLoading: true })
    try {
      const res = await deleteWO({ wo_id: [this.state.workorderToDelete.wo_id] })
      if (res.success > 0) Toast.success(`Work Order deleted successfully !`)
      else Toast.error(res.message)
      this.setState({ deleteLoading: false, isDeleteWorkorderOpen: false }, () => this.constructRequestPayload())
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong')
      this.setState({ deleteLoading: false, isDeleteWorkorderOpen: false })
    }
  }

  handleStatusFilterChange = v => this.setState({ statusFilter: v, page: 0, pageIndex: 1 }, () => this.constructRequestPayload())

  handleExportList = async () => {
    const payload = {
      pageIndex: 0,
      pageSize: 0,
      search_string: '',
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: [],
      wo_type: [],
      site_id: [],
    }
    try {
      this.setState({ isExportLoading: true })
      const res = await getAllWOs(payload)
      if (res.success > 0) {
        const excelData = []
        const list = get(res, 'data.list', [])
        list.forEach(d => excelData.push({ 'WO Number': d.wo_number, 'Work Type': d.wo_type_name, Facility: d.site_name, 'Start Date': getFormatedDate(d.start_date.split('T')[0]), 'Due Date': getFormatedDate(d.due_date.split('T')[0]), 'Due In': d.due_in, Status: d.wo_status }))
        exportSpreadSheet({ data: excelData, fileName: 'work-order-list' })
      } else Toast.error(res.message || 'Error exporting data. Please try again !')
      this.setState({ isExportLoading: false })
    } catch (error) {
      Toast.error('Error Exporting data. PLease try again !')
      this.setState({ isExportLoading: true })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
        <div className='bg-white' style={{ height: '100%', borderRadius: '4px', padding: '16px' }}>
          <div className='d-flex flex-row justify-content-between align-items-center mb-2' style={{ width: '100%' }}>
            <div className='d-flex flex-row align-items-center'>
              <StatusSelectPopup options={this.STATUS_ENUMS} statusFilterValues={this.state.statusFilter} onChange={this.handleStatusFilterChange} style={{ marginRight: '10px' }} />
              <DropDownMenu dropDownMenuOptions={this.dropDownMenuOptions} btnText={'Create Work Order'} />
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
                <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Export Work Orders' action={this.handleExportList} isLoading={this.state.isExportLoading} />
                {this.state.isExportLoading && <div className='ml-1 text-bold'>Exporting ...</div>}
              </div>
            </div>
            <div className='d-flex flex-row align-items-center'>
              {this.SearchControl()}
              <Button size='small' startIcon={<RotateLeftSharpIcon />} onClick={this.clearFilters} disabled={this.state.clearFilterButton} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
                Reset Filters
              </Button>
            </div>
            {/* {this.SearchControl()} */}
          </div>
          <div className='d-flex flex-row justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
            {/* <div></div>
            <Button size='small' startIcon={<RotateLeftSharpIcon />} onClick={this.clearFilters} disabled={this.state.clearFilterButton} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
              Reset Filters
            </Button> */}
            {/* <StatusSelectPopup options={this.state.statusChoiceList} statusFilterValues={this.state.statusFilter} onChange={this.constructRequestPayload} /> */}
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '85%', height: '85%' }}>
            <Table size='small' stickyHeader={true}>
              {this.HearderControl({ classes })}
              {this.state.loading ? (
                <TableLoader cols={7} />
              ) : _.isEmpty(this.state.rows) ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan='8' className={' Pendingtbl-no-datafound'}>
                      No data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {this.state.rows.map((tableRow, key) => {
                    return (
                      <TableRow key={key} onClick={() => history.push({ pathname: `${workOrderTypesPath[tableRow.wo_type]['path']}/${tableRow.wo_id}`, state: { filter: this.state.statusFilter, pageRows: this.state.rowsPerPage, search: this.state.searchString, pageIndex: this.state.pageIndex } })} className='table-with-row-click'>
                        <TableCell className={classes.tableCell}>{tableRow.manual_wo_number}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.wo_type_name}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.site_name}</TableCell>
                        <TableCell className={classes.tableCell}>{getFormatedDate(tableRow.start_date.split('T')[0])}</TableCell>
                        <TableCell className={classes.tableCell}>{this.getWorkOrderDueIn(tableRow)}</TableCell>
                        <TableCell className={classes.tableCell}>{this.getWorkOrderStatus(tableRow.wo_status_id)}</TableCell>
                        <TableCell className={classes.tableCell} style={tableRow.wo_status_id === 15 ? { pointerEvents: 'none' } : {}}>
                          <Tooltip title='Delete' placement='top'>
                            <IconButton
                              size='small'
                              onClick={e => {
                                e.stopPropagation()
                                this.setState({ workorderToDelete: tableRow, isDeleteWorkorderOpen: true })
                              }}
                            >
                              <DeleteOutlineOutlinedIcon fontSize='small' style={tableRow.wo_status_id === 15 ? { opacity: 0 } : { color: '#FF0000' }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              )}
            </Table>
          </div>
          {!_.isEmpty(this.state.rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
          <CreateAccWO open={this.state.accWOOpen} type={this.state.type} handleClose={() => this.setState({ accWOOpen: false })} />
          <DialogPrompt title='Delete Work Order' text='Are you sure you want to delete the Work Order ?' open={this.state.isDeleteWorkorderOpen} ctaText='Delete' actionLoader={this.state.deleteLoading} action={this.deleteWorkOrder} handleClose={() => this.setState({ isDeleteWorkorderOpen: false })} />
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(WorkOrderList)
