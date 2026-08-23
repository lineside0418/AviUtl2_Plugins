# How to Install AviUtl2 Plugins and Scripts

This page explains the basic steps for adding new plugins and scripts to AviUtl2.

## 1. Preparation

- **Download AviUtl2**: If you haven’t installed it yet, download the latest version from the official website.  
- **Extract the files**: The downloaded files may be compressed in ZIP format. Use the built-in Windows extraction tool or software like 7-Zip to extract them.

## 2. Installing Plugins

These are general installation steps. Please check the specific plugin’s download page for detailed instructions.

1. **Download**: Download the plugin file from the distribution page linked from the plugin’s download button.  
2. **Extract**: Unzip the downloaded ZIP file.  
3. **Place files**: Move the extracted files **directly** into the folder:  
   `C:\ProgramData\aviutl2\Plugin`
   - Since `C:\ProgramData` is a hidden folder, enable “Hidden items” in File Explorer via **View > Show > Hidden items** if you can’t see it.  
   - Be careful not to confuse `C:\ProgramData` with `C:\ProgramFiles`.

## 3. Installing Scripts

The process is similar to plugin installation. Please refer to each script’s download page for details.

1. **Download**: Download the script file from the linked distribution page.  
2. **Place files**: Move the extracted files **directly** into the folder:  
   `C:\ProgramData\aviutl2\Script`
   - `C:\ProgramData` is a hidden folder. If it’s not visible, enable “Hidden items” in File Explorer via **View > Show > Hidden items**.  
   - Again, make sure it’s `ProgramData`, not `ProgramFiles`.

## 4. Notes

- **Restart AviUtl2**: Always restart AviUtl2 after installing plugins or scripts. Otherwise, they won’t be recognized.  
- **Conflicts**: Sometimes, plugins may conflict with each other and cause AviUtl2 to malfunction. If problems occur, temporarily move the recently added plugin to another location to identify the cause.  
- **Version compatibility**: Make sure that the plugin version matches your AviUtl2 version and other installed plugins.  
- **Compatibility with AviUtl**: Scripts made for the original AviUtl generally won’t work in AviUtl2. This site only lists those confirmed to work with AviUtl2.
