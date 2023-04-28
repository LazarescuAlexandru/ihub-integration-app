import * as React from 'react';
import { useState } from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

// MUI components
import { 
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Stack
} from '@mui/material';

 

export default function IhubView(props) {
  const {  } = props;

  const [message, setMessage] = useState('');
  const [bookmark, setBookmark] = useState('');
  const [parameters, setParameters] = useState([]);
  const [interactivity, setInteractivity] = useState(false);
  const [enableToolbar, setEnableToolbar] = useState(false);


  const jsInject = () => {
    
      var m = document.createElement("script");
      m.setAttribute('type','text/javascript');
      m.setAttribute('src', `${process.env.REACT_APP_IHUB_URL}iportal/jsapi`);
      m.setAttribute('id', `ihub_view_js`);
      //remote loading
      console.log("Adding js file: " + `${process.env.REACT_APP_IHUB_URL}iportal/jsapi`);
      document.getElementsByTagName("head")[0].appendChild(m);
    
  }

  const jsEject = () => {
    
    let remainingTags = true;
    

   
      //unloading the ones I added
      console.log("Removing js file: ihub_view_js");
      
      var elem = document.getElementById("ihub_view_js");
      while (elem) {
        elem.parentNode.removeChild(elem);
        elem = document.getElementById("ihub_view_js");
      }
      
    
  }

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function componentWait() {
    console.log("Waiting for component to be  ready...");
  
    while (!window.actuate) {
      console.log('Not ready');
      await sleep(500);
    }
    console.log("Actuate loaded");

    window.actuate.load('viewer');
	  var reqOps = new window.actuate.RequestOptions( );
	  reqOps.setRepositoryType('Enterprise');
	  reqOps.setVolume('Default Volume');
	  reqOps.setCustomParameters({});
    if (!window.actuate.isInitialized( )){ 
	    window.actuate.initialize( `${process.env.REACT_APP_IHUB_URL}iportal/`,reqOps==undefined?null:reqOps, process.env.REACT_APP_IHUB_USER, process.env.REACT_APP_IHUB_PASSWORD, loadReport );
      console.log('Actuate initialize called with: ' + process.env.REACT_APP_IHUB_USER +  ' / ' + process.env.REACT_APP_IHUB_PASSWORD);
    } else {
      loadReport();
      console.log('Viewer called successfully');
    }
    

    
  }
	
	

  const loadReport = () => {
    let viewer1 = window.actuate.getViewer('ihub-report-content');
    if (!viewer1) {
      viewer1 = new window.actuate.Viewer( 'ihub-report-content' );
    }
    
		viewer1.setReportDesign('/Public/Flight Performance.rptdesign;1');
		var options = new window.actuate.viewer.UIOptions( );

    //create parameters from input array
    
    var parameterValues=[];
    for(let i=0; i<parameters.length; i++) {
      var param=new window.actuate.viewer.impl.ParameterValue();
      param.setName(parameters[i].name);
      if(parameters[i].value!==null) {
          param.setValue(parameters[i].value);
      } else {
        param.setValueIsNull(true);
      }
      parameterValues.push(param);
      }
    viewer1.setParameterValues(parameterValues);
    viewer1.setReportletBookmark(bookmark);
    
    
    //enable-disable toolbar
    options.enableToolBar(enableToolbar);


		viewer1.setUIOptions( options );
    viewer1.setSize(window.innerWidth * 0.74, window.innerHeight * 0.7);
   
    if (interactivity) {
      viewer1.submit(function() {viewer1.enableIV();});
    } else {
      viewer1.submit(function() {viewer1.disableIV();});
    }
		
  }

  const resizeReport = () => {
    let viewer1 = window.actuate.getViewer('ihub-report-content');
    if (viewer1) {
      viewer1.setSize(300, 300);
      viewer1.submit();
    }
  }


  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      console.log('iHub loading.');
      jsInject();
      componentWait();


      return () => {
        console.log('iHub unloading.');
        jsEject();
      }
       
    },[]
    );


  return (
    <React.Fragment>
        {<React.Fragment>
          <Stack direction={'column'} spacing={1}>
            
            {message && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: 'red'
                }}>
              {message}
            </Typography> }
            <Stack direction={'row'} spacing={1}>
                <Box key={'left panel'} sx={{width: '25vw', p: 2}}>
                  <Stack direction={'column'} spacing={1}>
                    Settings go here
                    <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                      <InputLabel id="select-bookmark">Bookmark</InputLabel>
                      <Select
                        labelId="select-bookmark"
                        id="select-sel-bk"
                        value={bookmark}
                        label="Bookmark"
                        onChange={(e) => {setBookmark(e.target.value)}} 
                      >
                        <MenuItem key={'none'} value={''}>{'(none)'}</MenuItem>
                        <MenuItem key={'average'} value={'average'}>{'average'}</MenuItem>
                        <MenuItem key={'percentage'} value={'percentage'}>{'percentage'}</MenuItem>
                      </Select>
                    </FormControl>
                    <Stack direction={'row-reverse'} >
                    
                      <IconButton
                        aria-label="refresh"
                        onClick={() => {loadReport()}}
                        disabled={false}
                      >
                        <CloudSyncIcon/>
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
                <Box key={'report panel'} 
                  sx={{
                    width: '74vw', 
                    height: '70vh', 
                    border: '1px solid black',
                    borderRadius: 2
                    }}>
                        
                      <div style={{border: '1px solid red', overflow: "hidden", overflowX: "auto", overflowY: "auto"}} id="ihub-report-content"></div>
                    
                </Box>

            </Stack>
            
            
          </Stack>
          
          
          </React.Fragment>}
          
        
    </React.Fragment>
  );
}
