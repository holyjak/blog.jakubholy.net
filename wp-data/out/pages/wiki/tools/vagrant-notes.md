---
title: "Vagrant Notes"
---
## Essential resources

Base boxes

  - [VagrantBox.es](https://www.vagrantbox.es/) (including boxes available at vagrantup.com and the Ubuntu boxes below)
  - [Ubuntu-provided base boxes](https://cloud-images.ubuntu.com/vagrant/)

## The Cool Stuff

  - Broken environment, vagrant cannot ssh, ...? Just run vagrant destroy and vagrant up again.
  - Have you encountered the "works for me" syndrom? With everybody using Vagrant (with the same version of it and VirtualBox), this shouldn't happen anymore

## Tips

### Install vagrant-vbguest to ensure matching version of VB and VB guest additions

For Vagrant to be able to comunicate properly with a VM, the version of Virtual Box Guest Additions installed there must be the same as the version of your Virtual Box. The vagrant addon [vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest) automatically re-installs the correct version of VB additions upon VM start (provided that vagrant actually manages to connect to the VM, which often fails when the versions do not match).

### Re-download the base box to get the latest VB guest additions

When you first use the [vagrant base box](https://files.vagrantup.com/lucid32.box), it's cached on your machine forever. However the Vagrant guys sometimes update the box with the latest Virtual Box Guest Additions so it's useful to remove and re-download it (unless you use  [vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest)):

    vagrant box list
    vagrant box remove lucid32

### It might help to remove host-only adatpers from Vagrant

If you experience Vagrant not being able to connect to the VM after having created it, it's likely because of network setup problems or because the version of VirtualBox and VB Guest Additions installed in the VM do not match. In any case you can try to remove the host-only adapter from the VM (or completely from VB) if it is there and keep only the NAT adapter.

## Pitfalls

### Vagrant can wait forever for VM to boot if VirtualBox and VB Guest Additions versions don't match

It's very important that your version of VirtualBox and the VirtualBox Guest Additions installed into the virtual machine match otherwise Vagrant will likely have problems connecting to the VM, signaled by waiting very long after printing "Waiting for VM to boot. This can take a few minutes."

See the related problem 'Vagrant up/halt/ssh Timeouts with "Failed to connect to VM via SSH"' in [Note To Self: What to Do When a Vagrant Machine Stops Working (Destroy or Up Failing)](/2012/03/24/note-to-self-how-to-solve-vagrant-destroy-failing-with-error-in-api-call-in-ffi-rb/ "Note To Self: What to Do When a Vagrant Machine Stops Working (Destroy or Up Failing)").

### Beware memory mapped files (e.g. Apache) etc.

Running in a virtual machine has its risks due to defects in the VM software. For example there was one [tricky problem with Apache sending old file content from a shared folder](https://frankooh.wordpress.com/2011/01/21/vboxsf-and-small-files/) due to Virtual Box, shared folder and memory-mapped content not working properly together. So be aware that VMs have their risks and if something strange is happening, ask uncle Google.

### Limitation of file permissions in shared folders

File permissions between the host and guest are much more limited then you would expect and it is likely that other VirtualBox users than vagrant won't have (write) access to the files/directories in the shared folder, even if you try to run chmod. Therefore make sure to run the services that need write access as the user vagrant.

(Host: OS X, Guest: Debian, VB 4.1.10)

### Symlinks in shared folders don't work (usually)

If a directory that you share with a vagrant VM contains a symbolic link, the link will most likely not be accessible from the VM (ex.: cannot access /vagrant/puppet-files-symlink/: No such file or directory).

VirtualBox has now support for symlinks with the proper host+guest combination however there clearly are still issues. The Vagrant issue 713 has [some workarounds and useful links to more information](https://github.com/mitchellh/vagrant/issues/713#issuecomment-4397462). There is also a [related VB issue](https://www.virtualbox.org/ticket/818#comment:92).

(Host: OS X, Guest: lucid32, VB: 4.1.4, Vagrant: 1.0.2)

## Troubleshooting

See the blog post [Note To Self: What to Do When a Vagrant Machine Stops Working (Destroy or Up Failing)](/2012/03/24/note-to-self-how-to-solve-vagrant-destroy-failing-with-error-in-api-call-in-ffi-rb/ "Note To Self: What to Do When a Vagrant Machine Stops Working (Destroy or Up Failing)") for:

  - Vagrant Destroy Failing with "Error in API call" in ffi.rb
  - Vagrant up/halt/ssh Timeouts with "Failed to connect to VM via SSH"
  - Installing Virtual Box Guess Additions

### vagrant up stops with "\[default\] Waiting for VM to boot. This can take a few minutes."

If it takes more then few minutes than likely there was a failure in network setup in the VM.

Solution 1: Stop it, run vagrant destroy, try again.

Solution 2: Reconfigure vagrant to start the VM in GUI mode, log into it via Virtual Box, check what's wrong with ssh/networking.

## Puppet Notes

##### wget must be run in the quiet mode?

Wget has been failing for me when run by puppet with "change from notrun to 0 failed: wget ... returned 8 instead of one of \[0\]" (8 = server error) while the same command executed from the command line worked just fine. It seems that wget used within an exec needs to be run with -q (or &\> /some/file).

### Useful Plugins

There are [many plugins](https://github.com/mitchellh/vagrant/wiki/Available-Vagrant-Plugins), some especially interesting are:

  - [vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest) - automatically upgrade VirtualBox Guest Additions on the guest if your VB version is newer
  - [vagrant-notify](https://github.com/fgrehm/vagrant-notify) - forward notifications from the guest (send via send-notify) to the host system to show them via its notification facilities (Growl/Notification Center/local send-notify); great if you run a build tool in the VM and want to be notfiied of errors etc. (see f.ex. grunt-notify)
  - [vagrant-cachier](https://github.com/fgrehm/vagrant-cachier) - enable of caching apt/yum/.. packages on the host and reuse them when starting a new machine (to save downloading time and bandwidth and to be able to run vagrant destroy+up offline)
