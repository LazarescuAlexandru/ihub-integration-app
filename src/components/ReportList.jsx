import * as React from 'react';
import { useState } from "react";


//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';


//import PDFViewer from 'pdf-viewer-reactjs';

// MUI components
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Paper
} from '@mui/material';

import { visuallyHidden } from '@mui/utils';

import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const headCells = [
  {
    id: 'name',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'type',
    sorting: false,
    numeric: false,
    disablePadding: false,
    label: 'Type',
  }
];




export default function ReportList(props) {
  const { runRequest, token, outSelected } = props;

  //for table
  const [rows, setRows] = useState([]);
  const [updatedList, setUpdatedList] = useState(false);

  const [parentId, setParentId] = useState([]);
  const [parentName, setParentName] = useState([]);
  const [curFolder, setCurFolder] = useState('root');

  const [selectedRow, setSelectedRow] = useState({});

  const getDateValue = (dt) => {
    return dt ? new Date(Date.parse(dt)).toLocaleDateString(navigator.language,{year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true} ) : ''; 
  }

  const getList = () => {
    
    let req = { 
      method: 'get', 
      url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/files${curFolder==='root'?'':`/${curFolder}`}?latestVersionOnly=true`, 
      headers: { 'AuthToken': `${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200) {
        setRows(res.data.itemList?.file ?? []);
      } else {
        setRows([]);
      }
      //setRowCount(res.data?.totalCount ?? 0);
      setUpdatedList(false);
    }, '', []);
  }

  const handleSelectRow = (row, isAction) => {
    if (isAction) {
      setSelectedRow((selectedRow.id===row.id)?selectedRow:row);
    } else {
      setSelectedRow((selectedRow.id===row.id)?{}:row);
    }
    if (row.fileType==='RPTDESIGN' && selectedRow.id!==row.id) {
      outSelected(row, parentName);
    } else {
      outSelected({}, []);
    }

    
  }

  const upFolder = () => {
    if (parentId.length>0) {
      setCurFolder(parentId[parentId.length-1]);
      let curArr = [...parentId];
      let curNames = [...parentName];
      curArr.pop();
      curNames.pop();
      setParentId(curArr);
      setParentName(curNames);
      handleRefreshList();
    } else {
      setCurFolder('root');
      handleRefreshList();
    }
  }

  const downFolder = (folder) => {
    
    setCurFolder(folder.id);
    let curArr = [...parentId];
    curArr.push(folder.id);
    setParentId(curArr);
    let curNameArr = [...parentName];
    curNameArr.push(folder.name);
    setParentName(curNameArr);
    
    handleRefreshList();
  }

  const handleRefreshList = () => {
    setRows([]);
    setSelectedRow({});

    setUpdatedList(true);
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        handleRefreshList();
    },[]
    );
  
  useEffect(
    () => {
      if (updatedList) {
        getList();
      }
    },[updatedList]
    );


  return (
      <React.Fragment>
            <Box height={"70vh"} 
              key="box-left-panel" 
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "auto", 
                overflowX: "hidden", 
                "&::-webkit-scrollbar": {
                  height: 3,
                  width: 3,
                  borderRadius: 2
                  },
                  "&::-webkit-scrollbar-track": {
                  backgroundColor: "white"
                  },
                  "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "gray",
                  borderRadius: 2
                  }
                  }}
                  >
                  {<TableContainer component={Paper} sx={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          overflowY: "auto", 
                          overflowX: "auto", 
                          "&::-webkit-scrollbar": {
                            height: 3,
                            width: 3,
                            borderRadius: 2
                            },
                            "&::-webkit-scrollbar-track": {
                            backgroundColor: "white"
                            },
                            "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "gray",
                            borderRadius: 2
                            }
                            }}>
                    <Table stickyHeader size="small" aria-label="table">
                      <TableHead>
                        <TableRow>
                          
                          {headCells.map((headCell) => (
                            <TableCell
                              key={headCell.id}
                              align={headCell.numeric ? 'right' : 'left'}
                              padding={headCell.disablePadding ? 'none' : 'normal'}
                            >
                              {headCell.label}
                            </TableCell>
                          ))}
                          <TableCell align="left">
                            <IconButton size="small" variant="outlined" color="primary" title="Refresh" onClick={() => { handleRefreshList() }}>
                                <RefreshIcon />
                            </IconButton>
                            <IconButton size="small" variant="outlined" color="success" title="Up" disabled={parentId===''} onClick={() => { upFolder() }}>
                              <DriveFolderUploadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      {<TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.name} hover selected={selectedRow.id==row.id}>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.name + (row.version ? ` (v. ${row.version})` : '')}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, false)}}>{row.fileType}</TableCell>
                            <TableCell align="left" onClick={() => {handleSelectRow(row, true)}}>
                              <Stack direction="row" spacing={0}>
                                {(row.fileType==='Directory') && <IconButton size="small" variant="outlined" color="primary" title="Open folder" onClick={() => { downFolder(row)  }}>
                                  <FolderOpenIcon />
                                </IconButton>}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>}
                    </Table>
                  </TableContainer>}
                </Box>

                
        </React.Fragment>
  );
}
