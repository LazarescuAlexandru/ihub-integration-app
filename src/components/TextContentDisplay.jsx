import * as React from 'react';

// MUI components
import { 
  Box,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

export default function TextContentDisplay(props) {
    const { jsonValue, setJsonValue, textValue, setTextValue } = props;

    return (
        <React.Fragment>
            <Dialog
                open={(JSON.stringify(jsonValue)!=='{}' || textValue!=='')}
                onClose={() => {setJsonValue({}); setTextValue('')}}
                aria-labelledby="info"
                aria-describedby="more-info"
                maxWidth={'xl'} 
                fullWidth
                >
                
                <DialogContent sx={{display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        overflowY: "auto", 
                        overflowX: "auto", 
                        "&::-webkit-scrollbar": {
                        height: 4,
                        width: 4,
                        borderRadius: 2
                        },
                        "&::-webkit-scrollbar-track": {
                        backgroundColor: "white"
                        },
                        "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "gray",
                        borderRadius: 2
                        }}}>
                <Box>
                    <div className="app-general-dialog">
                        <IconButton size="small" variant="outlined" color="default" title="Close" onClick={() => { setJsonValue({}); setTextValue('') }}
                            className="title-icon">
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Box >
                        {JSON.stringify(jsonValue)!=='{}' && <div><pre>{JSON.stringify(jsonValue,null,2)}</pre></div>}
                        {textValue!=='' && <Typography sx={{fontSize:'12px', whiteSpace: 'pre-line'}}>{textValue}</Typography>}
                    </Box>
                </Box>
                
                
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}