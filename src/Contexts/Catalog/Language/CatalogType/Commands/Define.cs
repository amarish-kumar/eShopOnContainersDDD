﻿using System;
using System.Collections.Generic;
using System.Text;
using Infrastructure.Commands;

namespace eShop.Catalog.CatalogType.Commands
{
    public class Define : StampedCommand
    {
        public Guid TypeId { get; set; }
        public string Type { get; set; }
    }
}
