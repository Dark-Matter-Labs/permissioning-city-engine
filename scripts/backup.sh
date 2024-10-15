#!/bin/bash

tar -cvf ./data/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz ./data/postgres_data
