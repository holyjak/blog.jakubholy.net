---
title: "Ubuntu@Thinkpad"
---
# My experiences from running Ubuntu on Lenovo ThinkPad

How to get things working.

My latest configuration:

* Ubuntu 10.04 Lucid Lynx Ubuntu 9.04 - the Jaunty Jackalope - released in April 2009
* ThinkPad R61

## ToC

* [Ubuntu 10.04 Lucid](#ubuntu1004lucid)
  - [Upgrading from 9.04 to 10.04](#upgradingfrom904to1004)
  - [HW](#hw) - wifi,[multiple displays](MultipledisplayswithNvidia) etc.
* [Ubuntu 9.04 Jaunty](#ubuntu904jaunty)
  - [Connectivity: Wifi, VPNs and firewalls](#connectivitywifivpnsandfirewalls)
* [Various](#various)
  - [Applications](#applications) - Eclipse etc.

# Ubuntu 10.04 Lucid

## Upgrading from 9.04 to 10.04

The upgrade from 9.04 to 9.10 and then to 10.04 was very smooth one, with only few issues:

* The upgrade to 9.10 switched my desktop to Xfc and presented itself as Xubuntu, which was quite a surprise, but after ugrading to 10.04 it went back to normal
* I accepted the new /etc/dnsmasq.conf and thus I had to re-insert the line "resolv-file=/etc/resolv.conf.forward" to get it working properly with resolvconf
* Lotus Notes 8.5 stopped displaying any content and had to be reinstalled. I followed these [instructions for Lotus Notes 8.5.1 on 32-bit Lucid Lynx](http://ubuntuforums.org/showpost.php?p=9237024&postcount=5), which refer a lot to the [LN 8.5.1 for 64-bit Lucid Lynx](http://usablesoftware.wordpress.com/2010/03/09/installing-lotus-notes-8-5-1-fp1-on-ubuntu-10-04-lucid-lynx-64bit/) (many thanks to both authors!), with the difference that I installed fixpacks 1, 2, and 3 and did not fetch the libraries from step 5 (I already had them in /usr/lib/)
* VMware 3.0 failed to compile vmnet due to "vnetUserListener.c:240: error: 'TASK_INTERRUPTIBLE' undeclared" and others,[to fix it you need to add one import](http://sadevil.org/blog/2009/12/31/vmware-player-3-vs-linux-2-6-32/) to some files. (The new [VMware 3.1 supports Ubuntu 10.04](http://www.vmware.com/support/player31/doc/releasenotes_player31.html#whatsnew) so it should perhaps work out of the box, but I haven't tried it.)

### Issues with Lucid

##### Corrupted display of the console, black screen while booting

**Symptoms**:

1. The screen is mostly black between selecting the kernel to boot from the Grub menu and the display of GDM
2. When I switch to the text console (C+A+F1), it's completely unreadable, the letters resemble much more colorful rectangles then letters, and the console is displayed twice as if there were two columns

**Cause:** This is due to the introduction of [Plymouth](http://www.ubuntugeek.com/ubuntu-10-4-lucid-boot-experience-changing-from-using-usplash-to-plymouth.html), an application supposed to display a nice boot progress indication, and the Nvidia graphics card and driver, which doesn't support the [KMS](https://wiki.ubuntu.com/X/KernelModeSetting) yet; there is a [related bug](https://bugs.launchpad.net/ubuntu/+source/plymouth/+bug/506717)

**Solution**: The [solution in the comment #99](https://bugs.launchpad.net/ubuntu/+source/plymouth/+bug/506717/comments/99) on the bug's page worked for me. (Note: none of the two files existed.) Now the text console is readable and I see some progress while booting.

Versions: Plymouth 0.8.2-2ubuntu2, Nvidia driver 'nvidia' v. 195.36.24

##### Volume control icon disappered from the panel

The volume control is now a part of the Indicator Applet, as well as battery state, Bluetooth control, and IM/email menu. You can thus either add the Indicator Applet to your panel or run the gnome-volume-control-applet (add it to the startup applications). Source: an [Ubuntu forum](http://ubuntuforums.org/showthread.php?t=1470635) .

##### GDM ignores the custom configuration file

_**TBD: Verify that the fix worked.**_ ?! Should have been fixed in 2.26.1-0ubuntu3 ?!

Changed to the GDM's configuration shall be done in /etc/gdm/custom.conf, however this file is ignored and it actually looks into the (non-existing) file gdm.conf-custom. See the [corresponding bug](https://bugs.launchpad.net/ubuntu/+source/gdm/+bug/395861) report.

Solution: sudo ln -s /etc/gdm/custom.conf /etc/gdm/gdm.conf-custom

Versions: GDM 2.30.2.is.2.30.0-0ubuntu2

## HW

### WiFi

For wifi to work, three conditions must be met:

1. WiFi and Bluetooth are enabled by the hardware switch (at the front side of the notebook, move the switch to the right)
2. WiFi must be enabled by the software switch (Fn+F5 or a command-line program)
3. The WiFi interface must be configured and brought up properly

#### Does the OS see the WiFi card?

$ lspci

```
03:00.0 Network controller: Intel Corporation PRO/Wireless 4965 AG or AGN [Kedron] Network Connection (rev 61)
```

$ sudo lshw -C network

```
*-network
 description: Wireless interface
 product: PRO/Wireless 4965 AG or AGN [Kedron] Network Connection
 vendor: Intel Corporation
 physical id: 0
 bus info: pci@0000:03:00.0
 logical name: wlan0
 version: 61
 serial: 00:21:5c:08:51:09
 width: 64 bits
 clock: 33MHz
 capabilities: pm msi pciexpress bus_master cap_list ethernet physical wireless
 configuration: broadcast=yes driver=iwlagn ip=192.168.2.101 latency=0 multicast=yes wireless=IEEE 802.11abgn
 resources: irq:32 memory:df2fe000-df2fffff
```

If the output starts with *-network DISABLED as below:

```
*-network DISABLED
 description: Wireless interface
 product: PRO/Wireless 4965 AG or AGN [Kedron] Network Connection
 ...
```

Then one of the three conditions above hasn't been met.

#### The wifi driver

You may want to verify that the wifi driver functions properly by [removing it if loaded and]  loading it into the kernel and checking the /var/log/kern.log for any related messages. The driver is iwlagn (in some earlier versions it was iwl4965).

$ sudo modprobe -r iwlagn && sudo modprobe -i iwlagn && tail /var/log/kern.log

```
iwlagn 0000:03:00.0: PCI INT A disabled
cfg80211: Calling CRDA to update world regulatory domain
cfg80211: World regulatory domain updated:
 (start_freq - end_freq @ bandwidth), (max_antenna_gain, max_eirp)
 (2402000 KHz - 2472000 KHz @ 40000 KHz), (300 mBi, 2000 mBm)
 (2457000 KHz - 2482000 KHz @ 20000 KHz), (300 mBi, 2000 mBm)
 (2474000 KHz - 2494000 KHz @ 20000 KHz), (300 mBi, 2000 mBm)
 (5170000 KHz - 5250000 KHz @ 40000 KHz), (300 mBi, 2000 mBm)
 (5735000 KHz - 5835000 KHz @ 40000 KHz), (300 mBi, 2000 mBm)
iwlagn: Intel(R) Wireless WiFi Link AGN driver for Linux, 1.3.27k
iwlagn: Copyright(c) 2003-2009 Intel Corporation
iwlagn 0000:03:00.0: PCI INT A -> GSI 17 (level, low) -> IRQ 17
iwlagn 0000:03:00.0: setting latency timer to 64
iwlagn 0000:03:00.0: Detected Intel Wireless WiFi Link 4965AGN REV=0x4
iwlagn 0000:03:00.0: Tunable channels: 13 802.11bg, 19 802.11a channels
iwlagn 0000:03:00.0: irq 32 for MSI/MSI-X
phy0: Selected rate control algorithm 'iwl-agn-rs'
```

If you watch the kern.log while switching the hardware wifi/BT switch on and off, you can observer messages like

```
iwlagn 0000:03:00.0: RF_KILL bit toggled to enable radio.
...
iwlagn 0000:03:00.0: RF_KILL bit toggled to disable radio.
```

#### Enabling the wifi interface

##### First, make sure that the hardware wifi/BT switch is in the ON position

##### Second, enable the software switch via Fn+F5 or the command line utility

Fn+F5 may be confusing because the wifi led may be not switched unless the device is also configured. Using the command-line utility is clearer:

$ sudo rfkill list wifi

```
18: phy0: Wireless LAN
 Soft blocked: no
 Hard blocked: no
```

This indicates that both the hardware switch and the software switch are enabled.

$ sudo rfkill block wifi
=> iwconfig wlan0 will return Tx-Power=off
$ sudo rfkill unblock wifi
=> iwconfig wlan0 will return Tx-Power=0 dBm, meaning, that 'off' indicates that one of the switches is disabled while 0 dBm indicates that the interfaces is ready but may yet need to be configured.

###### Possible unblock failure: Unknown error 132

If "rfkill unblock wifi" fails with

```
SIOCSIFFLAGS: Unknown error 132
```

then disable and re-enable the hardware wifi/BT switch and try again, the problem should be gone.

##### Third, configure the interface

The final step, which may or may not be necessary, is to configure the interface by executing

$ sudo ifconfig wlan0 up

* If it fails with "SIOCSIFFLAGS: Unknown error 132" then the interface isn't ready meaning that likely the HW or SW switch is disabled
* otherwise you should now be able to list wifi networks around you and connect to some

##### Forth, connect to a network

I'd suggest to try both the command-line 'iwlist scanning' and Wicd's [Refresh] (if you're using wicd) because sometimes one of them provides better results.

When connected to an access point, iwconfig should return information similar to those below:

```
$ iwconfig wlan0
wlan0     IEEE 802.11abgn  ESSID:"my_wifi_net"
 Mode:Managed  Frequency:2.462 GHz  Access Point: 00:17:1C:5B:55:AB
 Bit Rate=0 kb/s   Tx-Power=15 dBm
 Retry  long limit:7   RTS thr:off   Fragment thr:off
 Power Management:off
 Link Quality=61/70  Signal level=-49 dBm
 Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
 Tx excessive retries:0  Invalid misc:0   Missed beacon:0
```

Before you actually connect to a network it's normal that Tx-Power is 0 dBm.

### Multiple displays with Nvidia

Using two monitors is not that easy mainly because (it seems that) Ubuntu/X/Gnome suppose that the primary monitor is the left-most one and have problems if it isn't. To have Gnome panels on your main monitor and for new/popup windows to appear there, I've found the following two step configuration to work:

1. Suppose that you have the layout [NB][Mon], i.e. the notebook is left to the external monitor and you want to use the (bigger) external monitor Mon as the primary display
2. Run System - Administration - NVIDIA X Server Settings, select X Server Display Configuration, click [Detect Displays]
3. By now the Nvidia tool can see both your monitors. Click [Configure] for the external monitor and select TwinView.
4. For the _external monitor_:
  1. Check [x] Make this the primary display for the X screen
  2. Position: Right of
  3. Click [Apply]
  4. => this will make the Gnome panels to be on the external monitor while all the application windows will be moved to the notebook's screen
5. For the _external monitor_ again:
  1. Keep "Make this the primary display for the X screen" checked
  2. Position: Left of
  3. Click [Apply]
  4. => all applications are back on the (main) external monitor, the notebook's screen is completely empty (aside of a background image)
6. => You have Gnome panels and all windows on the external monitor and new popup and other windows open there as well. The configuration is contrary to the reality, in other words, you need to drag an application over the right border of the external monitor to get it onto the notebook's display.

# Ubuntu 9.04 Jaunty

## Connectivity: Wifi, VPNs and firewalls

I need to run up to two VPN clients and do connect from various locations including home and the company's network, using ethernet or wifi - that gives a couple of combinations.

Current set up:

1. **Wicd** as the GUI for managing network connections - the default Network Manager had problems with wifi and the VPNs (which is a long time ago and may be OK now but I prefer to stick with what works)
2. **resolvconf** for consolidating DNS entries from the various sources (DHCP, VPN clients - they must be configured to use it)
  - Configuring **OpenVPN**: into /etc/openvpn/*.conf add:

```
up /etc/openvpn/update-resolv-conf
down /etc/openvpn/update-resolv-conf
```
  - Configuring vpnc using the **kvpnc** GUI: check the option to use _dns_update_
3. Local DNS server and cache with **dnsmasq**
  - In _/etc/dnsmasq.conf_ add the line "_resolv-file=/etc/resolv.conf.forward_" to make it working corrrectly with resolvconf
4. Firewall:
  - GUI: I do not use Firestarter anymore because it required me to manually indicate either eth0 or wlan0 as the internet-facing interface when I switched to ethernet/wifi - indicated by "sendmsg Operation not permitted" when trying to ping something; I switched to gufw instead
  - Configuration - allow traffic on the VPN interfaces: needed for firestart (in /etc/firestarter/user-pre), not for (g)ufw

### Troubleshooting connectivity problems

Restart VPNs, resolvconf, dnsmaq.

#### What to do

1. Is the network interface up and configured? It should have an IP assigned. $ ifconfig -a
2. Are packets routed to the correct servers? Verify that the gateways are as expected (for example not routing everything to vmware's interface ...). $ route -n
3. Is the connection OK, i.e. are the gateways reachable? $ ping <IP of the default gateway as returned by route -n>
4. Is only the domain name resolution (DNS) broken, i.e. network works but when translating names to IPs we are contacting unreachable DNS servers?
  1. Try to ping a network server whose IP you know (e.g. google.com has addresses 74.125.87.103 ... .106, yahoo.de 87.248.121.75 and 217.146.186.221).
  2. Check availability of the name servers in /etc/resolv.conf or in /var/run/dnsmasq/resolv.conf if using dnsmasq by pinging them.
  3. Check what DNS servers are queried and how the query is delegated between them:

```
$ dig +trace google.com | grep Received
;; Received 512 bytes from 127.0.0.1#53(127.0.0.1) in 13 ms
;; Received 500 bytes from 198.41.0.4#53(a.root-servers.net) in 109 ms
;; Received 164 bytes from 192.12.94.30#53(e.gtld-servers.net) in 74 ms
;; Received 124 bytes from 216.239.32.10#53(ns1.google.com) in 28 ms
```
  4. Try to sumbit the query to a particular DNS server you know to be available: dig +trace @192.168.2.1 google.com

#### Resolvconf

Normally, there is a static file /etc/resolv.conf that contains a list of nameservers used for DNS resolution. If there are multiple application that need to change it, they are likely to override each other's changes and thus it's better to install the resolvconf daemon and configure the applications to use it (see above). Resolvconf will than merge those changes and maintain the file.

How it works:

1. /etc/resolv.conf is composed of /etc/resolvconf/resolv.conf.d/head + the dynamic entries + resolv.conf.d/tail; the file resolv.conf.d/original holds what was generated by the latest VPN/other client modifying the resolv.conf
  - If used together with dnsmasq then the dynamic entries will consist of only "nameserver 127.0.0.1", i.e. forwarded to dnsmasq
2. When the list of name servers changes, resolvconf executes the scripts in /etc/resolvconf/update.d/; for us the important one is update.d/dnsmasq :
  - **resolvconf -> dnsmasq**: The script update.d/dnsmasq reads name servers from all /etc/resolvconf/run/interface/<interface name, e.g. eth0> files and puts them into the dnsmasq's actual name server list, namely /var/run/dnsmasq/resolv.conf
    + The final order of name servers is determined by the lexical order of interfaces' names (e.g. eth0 > tun0 > wlan0) and the order of nameservers inside the interface files

Troubleshooting:

* Reload/restart: _sudo /etc/init.d/resolvconf restart_ or _sudo /etc/init.d/resolvconf reload_
* Documentation: read /usr/share/doc/resolvconf/README.gz
* Check /etc/resolv.conf (the generated one), /etc/resolv.conf.default (nameserver 127.0.0.1 because of using dnsmasq), resolv.conf.forward, resolv.conf.forward.default (used if no nameservers provided by DHCP), check name servers defined in /etc/resolvconf/run/interface/<interface name, e.g. eth0>

#### Dnsmasq

Dnsmasq is a caching DNS server, which forwards all requests to upstream servers and caches their responses for better performance.

How it works:

* To be used, "nameserver 127.0.0.1" must be in /etc/resolv.conf
* To work with resolvconf, edit _/etc/dnsmasq.conf_ and add the line _resolv-file=/etc/resolv.conf.forward_
* It reads the upstream servers from its own name server list, namely **/var/run/dnsmasq/resolv.conf** , which is maintained by resolvconf (see above)
  - To verify the name server config file check the command used to run it, namely its -r option, by executing _ps aux | grep dnsmasq_
* Normally it should detect when an upstream server isn't responding and favour another one though this seems not to be working, at least sometimes (e.g. when my vpnc disconnects without removing its name servers from the list)

Troubleshooting:

* Check the name server list it's using (/var/run/dnsmasq/resolv.conf)
* Check the log: _$ grep dnsmasq /var/log/daemon.log_

Useful options (can be set on the command line or - without the two '--' - in /etc/dnsmasq.conf)

* -o, --strict-order By default, dnsmasq will send queries to any of the upstream servers it knows about and tries to favour servers that are known to be up. Setting this flag forces dnsmasq to try each query with each server strictly in the order they appear in /etc/resolv.conf
* --all-servers By default, when dnsmasq has more than one upstream server available, it will send queries to just one server. Setting this flag forces dnsmasq to send all queries to all available servers. The reply from the server which answers first will be returned to the original requestor.

### Common problems

##### DNS lookup takes long

Indication: When opening a page in a browser, you see "looking up <server name>" for some time; or execute "host <server name>" from the command line.

Likely cause: The list of name servers starts with servers that are unavailable an thus each lookup is delayed by the timeout before the next name server is tried. Check the dnsmasq's resolv conf list.

Solution: Try to reset the network. At worst, tell wicd to use a static DNS servers and supply the right ones.

##### Ping fails with "sendmsg Operation not permitted"

Likely cause: Firewall, namely firestart, is blocking it.Verify by disabling the firewall and restarting.

Solution: Make sure that the interface (eth0 or wlan0) is configured as the internet (or intranet?) facing one. For me only Firestart exhibited this problem, ufw with the gufw GUI was OK.

Troubleshooting:

* Dnsmasq - check the command used to run it to find out where does it read the list of name servers from (_ps aux | grep dnsmasq_) - check the -r option, in my case "_-r /var/run/dnsmasq/resolv.conf_" - so check this file to learn what name servers and in what order are used actually

### Common problems

##### DNS lookup takes long

Indication: When opening a page in a browser, you see "looking up <server name>" for some time; or execute "host <server name>" from the command line.

Likely cause: The list of name servers starts with servers that are unavailable an thus each lookup is delayed by the timeout before the next name server is tried. Check the dnsmasq's resolv conf list.

Solution: Try to reset the network. At worst, tell wicd to use a static DNS servers and supply the right ones.

##### Ping fails with "sendmsg Operation not permitted"

Likely cause: Firewall, namely firestart, is blocking it.Verify by disabling the firewall and restarting.

Solution: Make sure that the interface (eth0 or wlan0) is configured as the internet (or intranet?) facing one. For me only Firestart exhibited this problem, ufw with the gufw GUI was OK.

# Various

## Applications

### Eclipse

#### Enable a shortcut for Show occurences in file (C+S+u not working)

The useful Eclipse action **Search - Occurrences in File - Identifier** has by default the shortcut Control+Shift+U. But under Gnome the shortcut [Control+Shift+U is used for Unicode character input](https://help.ubuntu.com/community/ComposeKey#Unicode%20composition), indicated by an underlined u when pressed. Assigning a different shortcut is easy but there are few "traps":

1. In Eclipse, go to Window - Preferences - General - Keys
2. Type the filter _occurr_ and click on "_Shows the Occurrences in File Quick Menu_". Do not confuse it with "Occurences in File" (binding C+S+A, when Editing in Structured T. Ed.)!
  1. Make sure that When is "_In Windows_", Category is "_Search_"
  2. Click [Unbind Command], click into the Binding field and type the keys that you want. Beware that some keys could conflict with existing bindings or global Gnome/system bindings. For me e.g. Control+Shift+S or F8 worked (though I might have to unbind conflicting bindings, I don't remember anymore).

Environment: Eclipse 3.5, Gnome 2.30.2, Ubuntu 10.04.

### IBM Applications

#### DB2 9.5 at Ubuntu 10.04

##### Avoiding SQL5043N (inability to start TCP/IP)

To avoid the error

[code light="true"]
SQL5043N Support for one or more communications protocols failed to start successfully.
However, core database manager functionality started successfully.[/code]

with the following cause (resulting with inaccessibility over TCP/IP):

[code light="true"]
DIA3201E The service name "db2c_db2inst1" specified in the database
manager configuration file cannot be found in the TCP/IP services file.
[/code]

You need to add into /etc/services an entry like:

[code light="true"]db2c_db2inst1 50000/tcp # DB2 connections for db2inst1[/code]

See a [detailed explanation at ServerFault](http://serverfault.com/questions/113244/sql5043n-support-for-one-or-more-communications-protocols-failed-to-start-success) .

##### Solving authentication issue with error #15

If connection via JDBC fails with

[code light="true"]com.ibm.db2.jcc.b.SqlException: Connection authorization failure occurred. Reason: Local security service non-retryable error.[/code]

and connection via the db2 command line client (connect to MyDb user myDbUser using MySecretPsw) fails with

[code light="true"]SQL30082N  Security processing failed with reason "15" ("PROCESSING FAILURE").[/code]

but you can normally log-in as the user (su - myDbUser) then you need to change the hashing mechanism for your password, e.g. like this:

[code light="true"]sudo usermod --password `openssl passwd MySecretPsw` myDbUser[/code]

Many thanks to Jan Šťastný for [describing the cause and solution](http://blog.stastnarodina.com/honza-en/spot/db2-sql30082n-security-processing-failed-with-reason-15/)!
