import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Image, Palette, FormatColorFill } from "@mui/icons-material";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExportWithBackground: () => void;
  onExportPaletteOnly: () => void;
  onExportColorPalette: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  onExportWithBackground,
  onExportPaletteOnly,
  onExportColorPalette,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Options</DialogTitle>
      <DialogContent>
        <List>
          <ListItem component="button" onClick={onExportWithBackground}>
            <ListItemIcon>
              <Image />
            </ListItemIcon>
            <ListItemText primary="Export Palette with Background" />
          </ListItem>
          <ListItem component="button" onClick={onExportPaletteOnly}>
            <ListItemIcon>
              <Palette />
            </ListItemIcon>
            <ListItemText primary="Export Palette Only" />
          </ListItem>
          <ListItem component="button" onClick={onExportColorPalette}>
            <ListItemIcon>
              <FormatColorFill />
            </ListItemIcon>
            <ListItemText primary="Export Color Palette" />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
